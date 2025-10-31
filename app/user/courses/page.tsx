"use client";
import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { Loader2, Search } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

interface Course {
  id: string;
  title: string;
  language: string;
  videos: string[];
  createdAt?: any;
}

type PlaylistVideo = {
  videoId: string;
  title: string;
  thumbnail: string;
};

// Parse a YouTube playlist or video URL into ids
function parseYouTubeUrl(urlStr: string): { videoId: string | null; playlistId: string | null } {
  try {
    const url = new URL(urlStr.trim());
    const hostname = url.hostname.toLowerCase();
    const isValid = (id: string | null) => !!id && /^[a-zA-Z0-9_-]+$/.test(id.trim());
    if (hostname.includes("youtube.com")) {
      const videoId = isValid(url.searchParams.get("v")) ? url.searchParams.get("v") : null;
      const playlistId = isValid(url.searchParams.get("list")) ? url.searchParams.get("list") : null;
      return { videoId, playlistId };
    }
    if (hostname.includes("youtu.be")) {
      const vid = url.pathname.slice(1);
      return { videoId: isValid(vid) ? vid : null, playlistId: null };
    }
    return { videoId: null, playlistId: null };
  } catch {
    return { videoId: null, playlistId: null };
  }
}

// Fetch playlist videos from API route
async function fetchPlaylistVideos(playlistId: string): Promise<PlaylistVideo[]> {
  try {
    const resp = await fetch(`/api/playlist/${playlistId}`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data.videos) ? data.videos : [];
  } catch {
    return [];
  }
}

// Load the YouTube Iframe API (robust for mobile/iPad)
let youtubeApiReadyPromise: Promise<void> | null = null;
function loadYouTubeAPI(): Promise<void> {
  if (youtubeApiReadyPromise) return youtubeApiReadyPromise;
  youtubeApiReadyPromise = new Promise<void>((resolve) => {
    if (window.YT && window.YT.Player) resolve();
    else {
      // Only add script if not present
      if (!document.getElementById("youtube-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
      window.onYouTubeIframeAPIReady = () => resolve();
    }
  });
  return youtubeApiReadyPromise;
}

// Safe Firestore get with retries (helps when mobile blocks/slowly restores network)
async function safeFirestoreGet(docRef: any, maxRetries = 2, baseDelay = 800) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const snap = await getDoc(docRef);
      return snap;
    } catch (err: any) {
      const msg = String(err?.message || "").toLowerCase();
      // If clearly blocked or network failure, retry with backoff
      if (msg.includes("failed to fetch") || msg.includes("blocked") || msg.includes("networkerror") || msg.includes("net::err_blocked_by_client")) {
        if (attempt === maxRetries) {
          console.warn("safeFirestoreGet: final retry failed", err);
          return null;
        }
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`safeFirestoreGet: network issue, retrying in ${delay}ms (attempt ${attempt + 1})`);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
        continue;
      }
      // For other errors, rethrow
      throw err;
    }
  }
  return null;
}

// --- Sidebar side helper ---
function getSidebarSideForElement(el: HTMLElement): 'left' | 'right' {
  const rect = el.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const rightThreshold = viewportWidth * 0.8; // last 20% of screen = far right
  const isTabletOrDesktop = viewportWidth >= 740; // include iPads in landscape/portrait

  console.log("🧭 Sidebar position check:", {
    elementRight: rect.right,
    viewportWidth,
    rightThreshold,
    isTabletOrDesktop,
    side: isTabletOrDesktop && rect.right >= rightThreshold ? 'left' : 'right',
  });

  if (isTabletOrDesktop && rect.right >= rightThreshold) {
    return 'left';
  }
  return 'right';
}

// --- Responsive YouTubePlayer with Full Playlist Support, Progress Saving, and Mobile/iPad Fixes (updated component) ---
function YouTubePlayer({
  playlistId,
  playlistVideos,
  initialVideoId,
  containerId,
  user,
  setActivePlaylist,
  setSelectedVideoId,
  onVideoProgressChange,
}: {
  playlistId: string;
  playlistVideos: PlaylistVideo[];
  initialVideoId: string;
  containerId: string;
  user: any;
  setActivePlaylist: ((v: any) => void) | null;
  setSelectedVideoId: ((v: string | null) => void) | null;
  onVideoProgressChange?: (progress: Record<string, number>) => void;
}) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  // --- Play Overlay State ---
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);

  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarSide, setSidebarSide] = useState<'left' | 'right'>('right');
  const fallbackFirstVideoId = playlistVideos[0]?.videoId || "";
  const initialId =
    playlistVideos.find((v) => v.videoId === initialVideoId)
      ? initialVideoId
      : fallbackFirstVideoId;
  const [currentVideoId, setCurrentVideoId] = useState(initialId);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});

  // --- Top-level: Progress helpers and player event handlers ---
  const getProgressDocRef = (videoId: string) =>
    doc(db, "users", user?.uid, "progress", `${playlistId}:${videoId}`);

  const saveProgressForVideo = async (videoId: string, time: number) => {
    if (!videoId) return;
    await setDoc(
      getProgressDocRef(videoId),
      { time, videoId, playlistId },
      { merge: true }
    );
  };

  // Saved times for all videos in playlist
  const savedTimesRef = useRef<Record<string, number>>({});

  // Save progress for current video
  const saveProgress = async () => {
    const player = playerRef.current;
    if (player && player.getCurrentTime && currentVideoId) {
      const currentTime = player.getCurrentTime();
      if (isNaN(currentTime)) return;
      savedTimesRef.current[currentVideoId] = currentTime;
      setVideoProgress((prev) => {
        const updated = { ...prev, [currentVideoId]: currentTime };
        if (onVideoProgressChange) {
          setTimeout(() => onVideoProgressChange(updated), 0);
        }
        return updated;
      });
      await saveProgressForVideo(currentVideoId, currentTime);
    }
  };

  // onPlayerReady handler
  const onPlayerReady = () => {
    const player = playerRef.current;
    const waitUntilPlayable = () => {
      try {
        const duration = player?.getDuration?.();
        if (duration && duration > 0) {
          const seekTime = savedTimesRef.current[currentVideoId] ?? 0;
          if (seekTime > 0) {
            player.seekTo(seekTime, true);
            setTimeout(() => player.pauseVideo(), 300);
          } else {
            player.pauseVideo();
          }
          setLoading(false);
          setShowPlayOverlay(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = setInterval(saveProgress, 5000);
        } else {
          setTimeout(waitUntilPlayable, 200);
        }
      } catch {
        setTimeout(waitUntilPlayable, 200);
      }
    };
    waitUntilPlayable();
  };

  // onPlayerStateChange handler
  const onPlayerStateChange = async (event: any) => {
    // Player states: -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
    if (event.data === window.YT.PlayerState.PAUSED) {
      await saveProgress();
      setShowPlayOverlay(true);
    }
    if (event.data === window.YT.PlayerState.ENDED) {
      await saveProgress();
      setShowPlayOverlay(true);
    }
    if (event.data === window.YT.PlayerState.PLAYING) {
      setShowPlayOverlay(false);
    }
    // Auto-play next video in playlist on END
    if (
      event.data === window.YT.PlayerState.ENDED &&
      playlistVideos.length > 1
    ) {
      const idx = playlistVideos.findIndex((v) => v.videoId === currentVideoId);
      if (idx !== -1 && idx < playlistVideos.length - 1) {
        setCurrentVideoId(playlistVideos[idx + 1].videoId);
      }
    }
  };

  // Fetch all progress for playlist (uses safeFirestoreGet to tolerate blocked requests on mobile)
  const fetchAllProgress = async () => {
    const result: Record<string, number> = {};
    await Promise.all(
      playlistVideos.map(async (v) => {
        try {
          const docSnap = await safeFirestoreGet(getProgressDocRef(v.videoId));
          if (!docSnap) return; // failed after retries
          const data = docSnap.exists() ? docSnap.data() : null;
          if (typeof data?.time === "number") {
            result[v.videoId] = data.time;
          }
        } catch (err) {
          // swallow per-video errors but log for debugging
          console.debug("fetchAllProgress: error for", v.videoId, err);
        }
      })
    );
    savedTimesRef.current = result;
    setVideoProgress(() => {
      if (onVideoProgressChange) {
        setTimeout(() => onVideoProgressChange(result), 0);
      }
      return result;
    });
  };

  // Always update currentVideoId when initialVideoId or playlistVideos changes
  useEffect(() => {
    const validInitial =
      playlistVideos.find((v) => v.videoId === initialVideoId)?.videoId ||
      fallbackFirstVideoId;
    setCurrentVideoId(validInitial);
    setShowPlayOverlay(true);
    // eslint-disable-next-line
  }, [initialVideoId, playlistVideos]);

  // Save and restore progress, Player setup
  useEffect(() => {
    let isMounted = true;
    let destroyRequested = false;
    setLoading(true);
    setShowPlayOverlay(true);
    const setupPlayer = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      await loadYouTubeAPI();
      if (!containerRef.current) return;
      await fetchAllProgress();
      if (!isMounted || destroyRequested) return;
      const allVideoIds = playlistVideos.map((v) => v.videoId);
      let videoIdIndex = allVideoIds.indexOf(currentVideoId);
      let videoId = currentVideoId;
      if (videoIdIndex === -1) {
        videoIdIndex = 0;
        videoId = allVideoIds[0];
      }
      let playlistArr: string[] = [];
      if (allVideoIds.length > 1) {
        playlistArr = [
          ...allVideoIds.slice(videoIdIndex + 1),
          ...allVideoIds.slice(0, videoIdIndex),
        ];
      }
      // Always clear previous player instance
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      const playerOptions: any = {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          controls: 1,
          modestbranding: 1,
          rel: 0,
          fs: 1,
          autoplay: 0,
          start: savedTimesRef.current[videoId] ?? 0,
          playsinline: 1,
          origin: window.location.origin,
          enablejsapi: 1,
          playlist: playlistArr.join(","),
        },
        events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange },
      };
      playerRef.current = new window.YT.Player(containerRef.current, playerOptions);
      setTimeout(() => {
        if (!containerRef.current) return;
        const iframeEl = containerRef.current.querySelector("iframe") as HTMLIFrameElement | null;
        if (iframeEl) {
          iframeEl.setAttribute(
            "allow",
            "fullscreen; autoplay; picture-in-picture; accelerometer; clipboard-write; encrypted-media; gyroscope"
          );
          iframeEl.setAttribute("allowfullscreen", "true");
          iframeEl.setAttribute("webkitallowfullscreen", "true");
          iframeEl.setAttribute("playsinline", "1");
          iframeEl.setAttribute("webkit-playsinline", "true");
          iframeEl.setAttribute("muted", "false");
          iframeEl.setAttribute("frameBorder", "0");
          iframeEl.setAttribute("tabIndex", "0");
          iframeEl.style.width = "100%";
          iframeEl.style.height = "100%";
          iframeEl.style.aspectRatio = "16/9";
          iframeEl.style.display = "block";
        }
      }, 400);
      setTimeout(() => { if (isMounted) setLoading(false); }, 500);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(saveProgress, 5000);
    };
    setupPlayer();
    return () => {
      isMounted = false;
      destroyRequested = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [user, playlistId, currentVideoId, containerId, playlistVideos]);

  // --- Dynamic sidebar position logic ---
  useEffect(() => {
    if (!showSidebar) return;
    if (typeof window === "undefined") {
      setSidebarSide("right");
      return;
    }
    if (containerRef.current) {
      setSidebarSide(getSidebarSideForElement(containerRef.current));
    }
  }, [showSidebar]);

  // Sidebar overlay (portal, always rendered for accessibility)
  const sidebar =
    typeof document !== "undefined"
      ? ReactDOM.createPortal(
          <div
            className={`fixed top-0 h-full bg-white p-4 flex flex-col z-[9999] shadow-2xl overflow-y-auto transition-transform duration-300 border-l border-gray-200
            ${
              sidebarSide === "left"
                ? (showSidebar ? "translate-x-0 left-0 right-auto" : "-translate-x-full left-0 right-auto")
                : (showSidebar ? "translate-x-0 right-0 left-auto" : "translate-x-full right-0 left-auto")
            }
            `}
            style={{
              maxWidth: "100vw",
              width: typeof window !== "undefined" && window.innerWidth >= 640 ? "22rem" : "100vw",
              boxSizing: "border-box",
              left: sidebarSide === "left" ? 0 : "auto",
              right: sidebarSide === "right" ? 0 : "auto",
            }}
          >
            <div className="flex justify-between items-center mb-4 relative">
              <h2 className="text-[#26667F] text-xl font-bold">Playlist</h2>
              <button
                type="button"
                onClick={() => {
                  setShowSidebar(false);
                }}
                className="top-0 right-0 text-white text-2xl font-bold p-2 bg-[#26667F] rounded-full hover:bg-[#1f5060] transition cursor-pointer pointer-events-auto shadow"
                aria-label="Close playlist"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar" style={{ maxHeight: "80vh" }}>
              {playlistVideos.map((v, idx) => (
                <button
                  key={v.videoId || idx}
                  onClick={() => {
                    setCurrentVideoId(v.videoId);
                    // setShowSidebar(false);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg shadow-sm transition-all duration-200 border border-transparent cursor-pointer
                    ${
                      v.videoId === currentVideoId
                        ? "bg-[#26667F] text-white shadow-lg border-[#26667F] scale-[1.03]"
                        : "bg-gray-100 hover:bg-[#e6f1f6] hover:shadow-md text-gray-800"
                    }
                  `}
                  style={{
                    outline: v.videoId === currentVideoId ? "2px solid #26667F" : undefined,
                  }}
                >
                  <img src={v.thumbnail} alt={v.title} className="w-20 h-12 object-cover rounded-lg border border-gray-200 shadow" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate text-inherit font-medium">{v.title}</span>
                    {typeof videoProgress[v.videoId] === "number" && (
                      <span className="text-xs text-gray-400 mt-1">
                        Progress: {Math.floor(videoProgress[v.videoId] / 60)}:
                        {String(Math.floor(videoProgress[v.videoId] % 60)).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  // Unified playlist sidebar and video player for all screen sizes
  return (
    <div className="w-full">
      <div
        className="yt-wrapper relative w-full bg-white rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-lg border border-gray-200"
        style={{ minHeight: "250px", maxWidth: "100%", width: "100%", position: "relative" }}
      >
        {/* Playlist sidebar */}
        {sidebar}

        {/* Overlays (play button and loading spinner) above the player container */}
        <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-black/80 mt-2 min-h-[250px] relative">
          {/* Overlay wrapper, sits above the iframe container for proper layering */}
          <div className="absolute inset-0 pointer-events-none z-30">
            {/* Play overlay button (mobile-friendly, always above iframe) */}
            {showPlayOverlay && !loading && (
              <button
                type="button"
                className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 bg-black/40 hover:bg-black/60 transition-colors duration-200 pointer-events-auto cursor-pointer"
                style={{
                  cursor: "pointer",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  height: "100%",
                  padding: 0,
                  background: "rgba(0,0,0,0.40)",
                }}
                aria-label="Play video"
                onClick={() => {
                  try {
                    if (playerRef.current && playerRef.current.playVideo) {
                      playerRef.current.playVideo();
                    }
                    setShowPlayOverlay(false);
                  } catch {}
                }}
              >
                <span
                  className="flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-lg"
                  style={{
                    width: 72,
                    height: 72,
                    boxShadow: "0 2px 16px rgba(0,0,0,0.30)",
                    transition: "background 0.2s",
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="24" fill="#26667F" fillOpacity="0.95"/>
                    <polygon points="19,15 36,24 19,33" fill="#fff"/>
                  </svg>
                </span>
              </button>
            )}
            {/* Loading spinner overlay, outside of containerRef */}
            {loading && (
                          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center  pointer-events-auto">
                <Loader2 className="animate-spin text-white" size={48} />
              </div>
            )}
          </div>
          {/* Only the YouTube iframe should be inside this containerRef */}
          <div
            ref={containerRef}
            className="yt-iframe w-full h-full aspect-video rounded-2xl"
            style={{ position: "relative" }}
          >
            {/* Only iframe will be rendered here by YT API */}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Courses Page ---
export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [playlistMap, setPlaylistMap] = useState<Record<string, PlaylistVideo[]>>({});
  const [activePlaylist, setActivePlaylist] = useState<{
    courseId: string;
    playlistId: string;
  } | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  // Remove isDesktop logic: always fetch and render playlists for all devices
  // Track video progress per active playlist
  const [playlistProgressMap, setPlaylistProgressMap] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.replace("/unauthorized");
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "courses"));
      const courseList: Course[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];

      // Fetch playlists immediately after fetching courses
      const playlistIds = new Set<string>();
      courseList.forEach(course => {
        course.videos?.forEach(url => {
          const { playlistId } = parseYouTubeUrl(url);
          if (playlistId) playlistIds.add(playlistId);
        });
      });

      const playlistData = await Promise.all(
        Array.from(playlistIds).map(async (pid) => {
          try {
            const resp = await fetch(`/api/playlist/${pid}`);
            if (!resp.ok) return { pid, videos: [] };
            const data = await resp.json();
            return { pid, videos: Array.isArray(data.videos) ? data.videos : [] };
          } catch {
            return { pid, videos: [] };
          }
        })
      );

      const playlistMapData: Record<string, PlaylistVideo[]> = {};
      playlistData.forEach(({ pid, videos }) => {
        playlistMapData[pid] = videos;
      });

      setPlaylistMap(playlistMapData);
      setCourses(courseList);
      setLoading(false);
    };

    fetchCourses();
  }, [user]);

  // Fetch playlist videos for all playlists shown (all devices)
  useEffect(() => {
    // Get all unique playlistIds
    const playlistIds = new Set<string>();
    for (const course of courses) {
      for (const url of course.videos || []) {
        const { playlistId } = parseYouTubeUrl(url);
        if (playlistId) playlistIds.add(playlistId);
      }
    }
    const fetchAll = async () => {
      const newMap: Record<string, PlaylistVideo[]> = {};
      await Promise.all(
        Array.from(playlistIds).map(async (pid) => {
          if (!playlistMap[pid]) {
            try {
              // Always fetch from API route
              const resp = await fetch(`/api/playlist/${pid}`);
              if (!resp.ok) {
                newMap[pid] = [];
                return;
              }
              const data = await resp.json();
              newMap[pid] = Array.isArray(data.videos) ? data.videos : [];
            } catch {
              newMap[pid] = [];
            }
          }
        })
      );
      if (Object.keys(newMap).length > 0) {
        setPlaylistMap((m) => ({ ...m, ...newMap }));
      }
    };
    if (playlistIds.size > 0) fetchAll();
    // eslint-disable-next-line
  }, [courses]);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Sidebar open state map: { [courseId:playlistId]: boolean }
  const [sidebarOpenMap, setSidebarOpenMap] = useState<Record<string, boolean>>({});

  // Ensure only one playlist sidebar is open at a time (across all courses)
  const setSidebarOpen = (courseId: string, playlistId: string, open: boolean) => {
    if (open) {
      const side = determineSidebarSide(courseId, playlistId);
      setSidebarSideMap(prev => {
        const updated = { ...prev };
        if (!updated[courseId]) updated[courseId] = {};
        updated[courseId][playlistId] = side;
        return updated;
      });
    }
    setSidebarOpenMap(prev => {
      if (open) {
        const newMap: Record<string, boolean> = {};
        newMap[`${courseId}:${playlistId}`] = true;
        return newMap;
      } else {
        return { ...prev, [`${courseId}:${playlistId}`]: false };
      }
    });
  };

  // --- Refs and sidebar side state for all course cards ---
  // Map of courseId to card DOM ref
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Map of courseId to sidebar side map (playlistId -> 'left' | 'right')
  const [sidebarSideMap, setSidebarSideMap] = useState<Record<string, Record<string, "left" | "right">>>({});

  // Helper to determine sidebar side for a playlist given courseId and playlistId
  const determineSidebarSide = (courseId: string, playlistId: string) => {
    if (typeof window === "undefined" || !cardRefs.current[courseId]) return "right";
    return getSidebarSideForElement(cardRefs.current[courseId]!);
  };

  // Watch for sidebar open changes, update sidebarSideMap for all open sidebars
  useEffect(() => {
    const updated: Record<string, Record<string, "left" | "right">> = { ...sidebarSideMap };
    filteredCourses.forEach((course) => {
      const playlists = (course.videos || [])
        .map((url) => {
          const { playlistId } = parseYouTubeUrl(url.trim());
          return playlistId;
        })
        .filter((pid) => !!pid) as string[];
      const uniquePlaylists = Array.from(new Set(playlists));
      uniquePlaylists.forEach((pid) => {
        if (sidebarOpenMap[`${course.id}:${pid}`]) {
          const side = determineSidebarSide(course.id, pid);
          if (!updated[course.id]) updated[course.id] = {};
          updated[course.id][pid] = side;
        }
      });
    });
    setSidebarSideMap(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpenMap, filteredCourses.length]);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-3 sm:px-6 lg:px-10 transition-all duration-300">
      {/* Full-screen loading overlay for page */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <Loader2 className="animate-spin text-white" size={60} />
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2 px-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#26667F]">
            Courses & Learning
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto">
            Discover a variety of courses to enhance your skills. Search and explore by title or language.
          </p>
        </header>

        {/* Search */}
        <div className="max-w-md mx-auto relative z-20">
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>

        {/* Loading / Results */}
        {loading ? null : filteredCourses.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No courses found matching your search.
          </p>
        ) : (
          <div className="pb-10">
            {/* Playlists and player visible for all devices */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {filteredCourses.map((course, courseIdx) => {
                // Gather all playlists for this course
                const playlists = (course.videos || [])
                  .map((url) => {
                    const { playlistId } = parseYouTubeUrl(url.trim());
                    return playlistId;
                  })
                  .filter((pid) => !!pid) as string[];
                // Remove duplicates
                const uniquePlaylists = Array.from(new Set(playlists));
                // Assign a ref for this course card
                if (!cardRefs.current[course.id]) {
                  cardRefs.current[course.id] = null;
                }
                return (
                  <Card
                    key={course.id}
                    ref={(el) => {
                      cardRefs.current[course.id] = el;
                    }}
                    className="transition-transform duration-200 flex flex-col rounded-2xl bg-white border border-gray-100 group"
                    style={{ minHeight: "330px" }}
                  >
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 pb-0">
                      <div className="flex items-center w-full">
                        <CardTitle
                          className={`text-xl font-bold text-[#26667F] transition flex-1 ${
                            activePlaylist?.courseId === course.id
                              ? "whitespace-normal"
                              : "truncate"
                          }`}
                        >
                          {course.title}
                        </CardTitle>
                        {/* Playlist button always aligned right, always visible if course has playlists */}
                        {uniquePlaylists.length > 0 && (
                          <button
                            key="playlist-main"
                            className={`flex items-center bg-[#26667F]/90 hover:bg-[#26667F] rounded-md px-2 py-1 text-white text-sm shadow-md border-2 border-transparent transition-all duration-200 cursor-pointer ml-2
                              ${
                                activePlaylist &&
                                activePlaylist.courseId === course.id &&
                                sidebarOpenMap[`${course.id}:${uniquePlaylists[0]}`]
                                  ? "border-[#26667F] scale-[1.04] shadow-lg"
                                  : "hover:scale-[1.03]"
                              }
                            `}
                            onClick={() => {
                              const pid = uniquePlaylists[0];
                              // Toggle sidebar only
                              setSidebarOpen(course.id, pid, !sidebarOpenMap[`${course.id}:${pid}`]);
                            }}
                            type="button"
                            aria-label={`Open playlist`}
                          >
                            <span className="mr-1">▶️</span>
                            Playlist
                          </button>
                        )}
                      </div>
                      <Badge className="uppercase tracking-wide text-xs bg-[#66A6B2] text-white px-3 py-1 rounded-full shadow">
                        {course.language}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      {/* Render playlist thumbnails and YouTubePlayer for all screen sizes */}
                      <>
                        {uniquePlaylists.length === 0 ? (
                          <p className="text-gray-400 text-center py-10">
                            No playlists available for this course.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-4 justify-center py-2 px-3">
                            {uniquePlaylists.map((pid, i) => {
                              const list = playlistMap[pid] || [];
                              // Use first video as thumbnail, fallback to YouTube default if missing
                              const thumb = list[0]?.thumbnail || (list[0]?.videoId ? `https://img.youtube.com/vi/${list[0].videoId}/mqdefault.jpg` : "");
                              // Determine if this is the active playlist
                              const isActive = activePlaylist &&
                                activePlaylist.courseId === course.id &&
                                activePlaylist.playlistId === pid;
                              // Is the selected video in this playlist?
                              const isThisPlaylistSelected = isActive;
                              return (
                                <div
                                  key={pid}
                                  className={`flex flex-col items-center w-full max-w-full sm:max-w-xs md:max-w-sm bg-white hover:bg-gray-50 rounded-2xl p-0 text-black shadow-md border-2 border-transparent transition-all duration-200
                                    ${
                                      isActive
                                        ? "border-[#26667F] scale-[1.03] shadow-lg"
                                        : "hover:scale-[1.01]"
                                    }
                                  `}
                                  style={{
                                    minWidth: "min(320px,90vw)",
                                    maxWidth: "480px",
                                    flex: "1 1 280px",
                                  }}
                                >
                                  <div
                                    className="w-full relative rounded-2xl overflow-hidden shadow-lg"
                                    style={{
                                      position: "relative",
                                      width: "100%",
                                      aspectRatio: "16/9",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      background: "transparent",
                                    }}
                                    onClick={async () => {
                                      if (!isThisPlaylistSelected && list.length > 0) {
                                        setActivePlaylist({ courseId: course.id, playlistId: pid });
                                        setSelectedVideoId(list[0].videoId);
                                      }
                                    }}
                                  >
                                    {isThisPlaylistSelected && list.length > 0 ? (
                                      <div className="absolute inset-0 w-full h-full">
                                        <YouTubePlayer
                                          playlistId={pid}
                                          playlistVideos={list}
                                          initialVideoId={
                                            selectedVideoId && list.some(v => v.videoId === selectedVideoId)
                                              ? selectedVideoId
                                              : list[0].videoId
                                          }
                                          containerId={`yt-player-thumb-${course.id}-${pid}`}
                                          user={user}
                                          setActivePlaylist={setActivePlaylist}
                                          setSelectedVideoId={setSelectedVideoId}
                                          onVideoProgressChange={(progress) => {
                                            setPlaylistProgressMap(prev => ({
                                              ...prev,
                                              [pid]: progress,
                                            }));
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      thumb && (
                                        <img
                                          src={thumb}
                                          alt="Playlist thumbnail"
                                          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                                          style={{
                                            objectFit: "cover",
                                            width: "100%",
                                            height: "100%",
                                          }}
                                        />
                                      )
                                    )}
                                  </div>
                                  {/* Label for number of videos, below thumbnail */}
                                  <div className="w-full flex flex-col items-center px-2 py-2">
                                    <span className="text-xs opacity-80 mt-1">
                                      {list.length > 0
                                        ? `${list.length} videos`
                                        : "Loading..."}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {/* No separate large player below thumbnails */}
                        {/* Playlist sidebar per course+playlist */}
                        {uniquePlaylists.map((pid, i) => {
                          const list = playlistMap[pid] || [];
                          const isOpen = sidebarOpenMap[`${course.id}:${pid}`];
                          // Use video progress from playlistProgressMap for this playlist
                          const videoProgressForSidebar = playlistProgressMap[pid] || {};
                          // Only render sidebar if open
                          if (!isOpen) return null;
                          // Use sidebarSideMap at top-level for this course/playlist
                          const sidebarSide = (sidebarSideMap[course.id] && sidebarSideMap[course.id][pid]) || "right";
                          return (
                            <div
                              key={`sidebar-${pid}`}
                              className={`fixed top-0 h-full bg-white p-4 flex flex-col z-[9999] shadow-2xl overflow-y-auto transition-transform duration-300 border-l border-gray-200
                                ${
                                  sidebarSide === "left"
                                    ? "left-0 right-auto"
                                    : "right-0 left-auto"
                                }
                                ${
                                  isOpen
                                    ? "translate-x-0"
                                    : (sidebarSide === "left"
                                      ? "-translate-x-full"
                                      : "translate-x-full")
                                }
                              `}
                              style={{
                                maxWidth: "100vw",
                                width: typeof window !== "undefined" && window.innerWidth >= 640 ? "22rem" : "100vw",
                                boxSizing: "border-box",
                                left: sidebarSide === "left" ? 0 : "auto",
                                right: sidebarSide === "right" ? 0 : "auto",
                              }}
                            >
                              <div className="flex justify-between items-center mb-4 relative">
                                <h2 className="text-[#26667F] text-xl font-bold">Playlist {i + 1}</h2>
                                <button
                                  type="button"
                                  onClick={() => setSidebarOpen(course.id, pid, false)}
                                  className="top-0 right-0 text-white text-2xl font-bold p-2 bg-[#26667F] rounded-full hover:bg-[#1f5060] transition cursor-pointer pointer-events-auto shadow"
                                  aria-label="Close playlist"
                                >
                                  ×
                                </button>
                              </div>
                              <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar" style={{ maxHeight: "80vh" }}>
                                {list.map((v, idx) => (
                                  <button
                                    key={v.videoId || idx}
                                    onClick={() => {
                                      setActivePlaylist({ courseId: course.id, playlistId: pid });
                                      setSelectedVideoId(v.videoId);
                                      // setSidebarOpen(course.id, pid, false);
                                    }}
                                    className={`flex items-center gap-3 p-2 rounded-lg shadow-sm transition-all duration-200 border border-transparent cursor-pointer
                                      ${
                                        v.videoId === selectedVideoId
                                          ? "bg-[#26667F] text-white shadow-lg border-[#26667F] scale-[1.03]"
                                          : "bg-gray-100 hover:bg-[#e6f1f6] hover:shadow-md text-gray-800"
                                      }
                                    `}
                                    style={{
                                      outline: v.videoId === selectedVideoId ? "2px solid #26667F" : undefined,
                                    }}
                                  >
                                    <img src={v.thumbnail} alt={v.title} className="w-20 h-12 object-cover rounded-lg border border-gray-200 shadow" />
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <span className="truncate text-inherit font-medium">{v.title}</span>
                                      {/* Progress timestamp for each video */}
                                      {typeof videoProgressForSidebar?.[v.videoId] === "number" ? (
                                        <span className="text-xs text-gray-400 mt-1">
                                          Progress: {Math.floor(videoProgressForSidebar[v.videoId] / 60)}:
                                          {String(Math.floor(videoProgressForSidebar[v.videoId] % 60)).padStart(2, "0")}
                                        </span>
                                      ) : null}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
