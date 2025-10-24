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

// Robustly fetch playlist videos (no API key, fallback for mobile/iPad)
async function fetchPlaylistVideos(playlistId: string): Promise<PlaylistVideo[]> {
  try {
    // Use a CORS proxy for client-side fetch; in production, use your own proxy/server
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    const resp = await fetch(
      "https://corsproxy.io/?" + encodeURIComponent(url)
    );
    const html = await resp.text();
    // Parse JSON from ytInitialData (robust for mobile/desktop/iPad)
    const dataMatch = html.match(/var ytInitialData = (.*?);\s*<\/script>/);
    let videos: PlaylistVideo[] = [];
    if (dataMatch) {
      try {
        const ytData = JSON.parse(dataMatch[1]);
        // Traverse to playlist videos
        const contents =
          ytData?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
            ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]
            ?.playlistVideoListRenderer?.contents;
        if (Array.isArray(contents)) {
          for (const c of contents) {
            const r = c.playlistVideoRenderer;
            if (r && r.videoId) {
              videos.push({
                videoId: r.videoId,
                title:
                  r.title?.runs?.[0]?.text ||
                  r.title?.simpleText ||
                  `Video ${videos.length + 1}`,
                thumbnail:
                  r.thumbnail?.thumbnails?.[0]?.url ||
                  `https://img.youtube.com/vi/${r.videoId}/mqdefault.jpg`,
              });
            }
          }
        }
      } catch {}
    }
    // Fallback: regex for playlistVideoRenderer blocks
    if (videos.length === 0) {
      const videoPattern = /{"playlistVideoRenderer":(.*?)}\s*[,}]/g;
      let match;
      while ((match = videoPattern.exec(html))) {
        try {
          const obj = JSON.parse(match[1]);
          const videoId = obj.videoId;
          const title =
            obj.title?.runs?.[0]?.text ||
            obj.title?.simpleText ||
            `Video ${videos.length + 1}`;
          const thumbnail =
            obj.thumbnail?.thumbnails?.[0]?.url ||
            `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
          if (videoId) {
            videos.push({ videoId, title, thumbnail });
          }
        } catch {}
      }
    }
    // Final fallback: just grab video IDs from HTML
    if (videos.length === 0) {
      const fallbackPattern = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
      let m;
      const ids: string[] = [];
      while ((m = fallbackPattern.exec(html))) {
        if (!ids.includes(m[1])) ids.push(m[1]);
      }
      for (const vid of ids.slice(0, 20)) {
        videos.push({
          videoId: vid,
          title: `Video ${videos.length + 1}`,
          thumbnail: `https://img.youtube.com/vi/${vid}/mqdefault.jpg`,
        });
      }
    }
    return videos;
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

// --- Responsive YouTubePlayer with Full Playlist Support, Progress Saving, and Mobile/iPad Fixes (updated component) ---
function YouTubePlayer({
  playlistId,
  playlistVideos,
  initialVideoId,
  containerId,
  user,
  setActivePlaylist,
  setSelectedVideoId,
}: {
  playlistId: string;
  playlistVideos: PlaylistVideo[];
  initialVideoId: string;
  containerId: string;
  user: any;
  setActivePlaylist: ((v: any) => void) | null;
  setSelectedVideoId: ((v: string | null) => void) | null;
}) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  // For dynamic sidebar position
  const [sidebarSide, setSidebarSide] = useState<'left' | 'right'>('right');
  // Always use first video if initialVideoId is missing or not in playlistVideos
  const initialId = playlistVideos.find((v) => v.videoId === initialVideoId)
    ? initialVideoId
    : playlistVideos[0]?.videoId || "";
  const [currentVideoId, setCurrentVideoId] = useState(initialId);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [iframeKey, setIframeKey] = useState(0); // force iframe reload for mobile/iPad

  // Detect mobile/iPad/tablet for force reload (user agent check)
  const isMobileOrTablet =
    typeof window !== "undefined" &&
    /android|iphone|ipad|ipod|mobile|tablet/i.test(navigator.userAgent);

  // Always update currentVideoId when initialVideoId changes
  useEffect(() => {
    const validInitial =
      playlistVideos.find((v) => v.videoId === initialVideoId)?.videoId ||
      playlistVideos[0]?.videoId ||
      "";
    setCurrentVideoId(validInitial);
    // Always force iframe reload on initial video change on mobile/iPad
    if (isMobileOrTablet) setIframeKey((k) => k + 1);
    // eslint-disable-next-line
  }, [initialVideoId, playlistVideos]);

  // On currentVideoId change, force iframe reload on mobile/iPad
  useEffect(() => {
    if (isMobileOrTablet) setIframeKey((k) => k + 1);
    // eslint-disable-next-line
  }, [currentVideoId]);

  // When playlistVideos load, force iframe reload on mobile/iPad
  useEffect(() => {
    if (isMobileOrTablet && playlistVideos.length > 0) {
      setIframeKey((k) => k + 1);
    }
  }, [playlistVideos]);

  // --- Save and restore progress per video ---
  useEffect(() => {
    let savedTimes: Record<string, number> = {};
    if (!user) {
      setLoading(false);
      return;
    }
    const getProgressDocRef = (videoId: string) =>
      doc(db, "users", user.uid, "progress", `${playlistId}:${videoId}`);
    const saveProgressForVideo = async (videoId: string, time: number) => {
      if (!videoId) return;
      await setDoc(
        getProgressDocRef(videoId),
        { time, videoId, playlistId },
        { merge: true }
      );
    };
    const saveProgress = async () => {
      const player = playerRef.current;
      if (player && player.getCurrentTime && currentVideoId) {
        const currentTime = player.getCurrentTime();
        if (isNaN(currentTime)) return;
        savedTimes[currentVideoId] = currentTime;
        setVideoProgress((prev) => ({ ...prev, [currentVideoId]: currentTime }));
        await saveProgressForVideo(currentVideoId, currentTime);
      }
    };
    const onPlayerReady = () => {
      const player = playerRef.current;
      const waitUntilPlayable = () => {
        try {
          const duration = player?.getDuration?.();
          if (duration && duration > 0) {
            const seekTime = savedTimes[currentVideoId] ?? 0;
            if (seekTime > 0) {
              player.seekTo(seekTime, true);
              setTimeout(() => player.pauseVideo(), 300);
            } else {
              player.pauseVideo();
            }
            setLoading(false);
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
    const onPlayerStateChange = async (event: any) => {
      if (
        event.data === window.YT.PlayerState.PAUSED ||
        event.data === window.YT.PlayerState.ENDED
      ) {
        await saveProgress();
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
    const fetchAllProgress = async () => {
      savedTimes = {};
      await Promise.all(
        playlistVideos.map(async (v) => {
          try {
            const docSnap = await getDoc(getProgressDocRef(v.videoId));
            const data = docSnap.exists() ? docSnap.data() : null;
            if (typeof data?.time === "number") {
              savedTimes[v.videoId] = data.time;
            }
          } catch {}
        })
      );
      setVideoProgress(savedTimes);
    };
    // --- YouTube Player setup ---
    const setupPlayer = async () => {
      await loadYouTubeAPI();
      if (!containerRef.current) return;
      await fetchAllProgress();
      let player = playerRef.current;
      const iframeId = `${containerId}-iframe`;
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
      // Remove any existing div/iframe for this player (robust for mobile/iPad reloads)
      const parent = containerRef.current;
      const existingDiv = document.getElementById(iframeId);
      if (existingDiv && parent.contains(existingDiv)) {
        parent.removeChild(existingDiv);
      }
      // Only create the player div if it doesn't already exist
      let newDiv = document.getElementById(iframeId);
      if (!newDiv) {
        newDiv = document.createElement("div");
        newDiv.id = iframeId;
        newDiv.className = "yt-iframe w-full h-full";
        parent.appendChild(newDiv);
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
          start: savedTimes[videoId] ?? 0,
          playsinline: 1,
          origin: window.location.origin,
          enablejsapi: 1,
          playlist: playlistArr.join(","),
        },
        events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange },
      };
      player = new window.YT.Player(iframeId, playerOptions);
      playerRef.current = player;
      // Set attributes for iOS/mobile/iPad
      setTimeout(() => {
        const iframeEl = document
          .querySelector(`#${iframeId} iframe`) as HTMLIFrameElement | null;
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
      setTimeout(() => setLoading(false), 500);
    };
    if (!isMobileOrTablet) {
      setLoading(true);
      setupPlayer();
    } else {
      // On mobile/iPad, let iframe reload on key change (see below)
      setLoading(false);
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(saveProgress, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [user, playlistId, currentVideoId, containerId, playlistVideos]);

  // Destroy player if playlistId changes (full playlist switch)
  useEffect(() => {
    return () => {
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
  }, [playlistId, containerId]);

  // --- Dynamic sidebar position logic ---
  useEffect(() => {
    if (!showSidebar) return;
    // Only run on desktop/tablet, not on mobile/iPad (where sidebar is always right)
    if (typeof window === "undefined" || window.innerWidth < 640) {
      setSidebarSide("right");
      return;
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      // If most of the player is on the right, show sidebar on far left.
      if (rect.left > viewportWidth * 0.55) {
        setSidebarSide("left");
      }
      // If most of the player is on the left, show sidebar on far right.
      else if (rect.right < viewportWidth * 0.45) {
        setSidebarSide("right");
      }
      // If player is near the center, pick the side with more space
      else {
        // Distance from left and right edges
        const leftSpace = rect.left;
        const rightSpace = viewportWidth - rect.right;
        setSidebarSide(leftSpace > rightSpace ? "left" : "right");
      }
    }
  }, [showSidebar]);

  // Sidebar overlay (portal, always rendered for accessibility)
  const sidebar =
    typeof document !== "undefined"
      ? ReactDOM.createPortal(
          <div
            className={`fixed top-0 h-full bg-white p-3 flex flex-col z-[9999] shadow-xl overflow-y-auto transition-transform duration-300
            ${
              sidebarSide === "left"
                ? (showSidebar ? "translate-x-0 left-0 right-auto" : "-translate-x-full left-0 right-auto")
                : (showSidebar ? "translate-x-0 right-0 left-auto" : "translate-x-full right-0 left-auto")
            }
            `}
            style={{
              maxWidth: "100vw",
              width: typeof window !== "undefined" && window.innerWidth >= 640 ? "20rem" : "100vw",
              boxSizing: "border-box",
              left: sidebarSide === "left" ? 0 : "auto",
              right: sidebarSide === "right" ? 0 : "auto",
            }}
          >
            <div className="flex justify-between items-center mb-3 relative">
              <h2 className="text-black text-lg font-semibold">Playlist</h2>
              <button
                type="button"
                onClick={() => {
                  setShowSidebar(false);
                  if (setActivePlaylist) setActivePlaylist(null);
                  if (setSelectedVideoId) setSelectedVideoId(null);
                }}
                className="top-0 right-0 text-white text-2xl font-bold p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition cursor-pointer pointer-events-auto"
                aria-label="Close playlist"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col space-y-2 overflow-y-auto" style={{ maxHeight: "80vh" }}>
              {playlistVideos.map((v, idx) => (
                <button
                  key={v.videoId || idx}
                  onClick={() => {
                    setCurrentVideoId(v.videoId);
                    setShowSidebar(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded ${
                    v.videoId === currentVideoId ? "bg-[#26667F] text-white" : "hover:bg-gray-700"
                  } transition`}
                  style={{
                    outline: v.videoId === currentVideoId ? "2px solid #26667F" : undefined,
                  }}
                >
                  <img src={v.thumbnail} alt={v.title} className="w-20 h-12 object-cover rounded" />
                  <span className="truncate text-inherit">{v.title}</span>
                  {typeof videoProgress[v.videoId] === "number" && (
                    <span className="ml-2 text-xs text-gray-300">
                      {Math.floor(videoProgress[v.videoId] / 60)}:
                      {String(Math.floor(videoProgress[v.videoId] % 60)).padStart(2, "0")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  // Mobile playlist bar: visible and functional on small screens
  const mobileBar = (
    <div
      className="flex flex-nowrap overflow-x-auto scrollbar-thin justify-start gap-2 mt-2 bg-[#1a1a1a] text-white p-2 rounded-md w-full"
      style={{ WebkitOverflowScrolling: "touch", maxWidth: "100vw" }}
    >
      {playlistVideos.map((v, idx) => (
        <button
          key={v.videoId || idx}
          onClick={() => setCurrentVideoId(v.videoId)}
          className={`flex items-center gap-2 px-2 py-1 text-sm rounded ${
            v.videoId === currentVideoId
              ? "bg-[#26667F] ring-2 ring-[#26667F] text-white"
              : "bg-gray-700 hover:bg-[#1f5060]"
          } transition whitespace-nowrap`}
          style={{
            minWidth: "120px",
            outline: v.videoId === currentVideoId ? "2px solid #26667F" : undefined,
          }}
        >
          <img
            src={v.thumbnail}
            alt={v.title}
            className="w-8 h-5 object-cover rounded"
          />
          <span className="truncate">{v.title}</span>
          {typeof videoProgress[v.videoId] === "number" && (
            <span className="ml-2 text-xs text-gray-300">
              {Math.floor(videoProgress[v.videoId] / 60)}:
              {String(Math.floor(videoProgress[v.videoId] % 60)).padStart(2, "0")}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  // Updated responsive return for mobile/iPad UI
  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="yt-wrapper relative w-full bg-white rounded-lg overflow-hidden flex flex-col items-center justify-center"
        style={{ minHeight: "250px", maxWidth: "100%", width: "100%", position: "relative" }}
      >
        {/* Playlist sidebar button */}
        <button
          className={`absolute top-3 ${
            sidebarSide === "left" ? "left-3 sm:left-4" : "right-3 sm:right-4"
          } bg-[#26667F] text-white px-3 py-1.5 rounded-md text-sm z-20 sm:top-4`}
          onClick={() => setShowSidebar((v) => !v)}
          aria-label="Open playlist"
        >
          ▶️ Playlist
        </button>

        {/* Playlist sidebar */}
        {sidebar}

        {/* Video player */}
        {isMobileOrTablet ? (
          playlistVideos.length === 0 ? (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded">
              <Loader2 className="animate-spin text-[#26667F]" size={32} />
              <span className="ml-2 text-gray-600">Loading playlist...</span>
            </div>
          ) : (
            <iframe
              key={iframeKey} // force reload when video changes or playlist loads
              className="yt-iframe w-full aspect-video"
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentVideoId}?playlist=${playlistVideos
                .map((v) => v.videoId)
                .filter((id) => id !== currentVideoId)
                .join(",")}&controls=1&rel=0&modestbranding=1&autoplay=0&playsinline=1`}
              allow="fullscreen; autoplay; picture-in-picture"
              allowFullScreen
              style={{ minHeight: "250px", display: "block" }}
            />
          )
        ) : (
          <div
            id={`${containerId}-iframe`}
            className="yt-iframe w-full h-full aspect-video"
          />
        )}

        {/* Mobile playlist bar */}
        <div className="block sm:hidden w-full mt-2">
          {playlistVideos.map((v, idx) => (
            <button
              key={v.videoId || idx}
              onClick={() => setCurrentVideoId(v.videoId)}
              className={`flex items-center gap-2 px-2 py-1 text-sm rounded ${
                v.videoId === currentVideoId
                  ? "bg-[#26667F] ring-2 ring-[#26667F] text-white"
                  : "bg-gray-700 hover:bg-[#1f5060]"
              } transition whitespace-nowrap`}
              style={{ minWidth: "120px" }}
            >
              <img
                src={v.thumbnail}
                alt={v.title}
                className="w-8 h-5 object-cover rounded"
              />
              <span className="truncate">{v.title}</span>
            </button>
          ))}
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
      const querySnapshot = await getDocs(collection(db, "courses"));
      const courseList: Course[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
      setCourses(courseList);
      setLoading(false);
    };
    fetchCourses();
  }, [user]);

// Fetch playlist videos for all playlists shown
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
            const vids = await fetchPlaylistVideos(pid);
            // Robust fallback: if no videos found, try to parse from URLs or fallback to empty
            newMap[pid] = Array.isArray(vids) && vids.length > 0 ? vids : [];
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

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-3 sm:px-6 lg:px-10 transition-all duration-300">
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#26667F]" size={48} />
            <p className="text-gray-600 text-lg">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No courses found matching your search.
          </p>
        ) : (
          <div className="pb-10">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCourses.map((course) => {
                // Gather all playlists for this course
                const playlists = (course.videos || [])
                  .map((url) => {
                    const { playlistId } = parseYouTubeUrl(url.trim());
                    return playlistId;
                  })
                  .filter((pid) => !!pid) as string[];
                // Remove duplicates
                const uniquePlaylists = Array.from(new Set(playlists));
                return (
                  <Card
                    key={course.id}
                    className="hover:shadow-md transition-transform duration-200 flex flex-col rounded-lg bg-white border border-gray-100"
                  >
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <CardTitle className="text-lg font-semibold text-[#26667F]">
                        {course.title}
                      </CardTitle>
                      <Badge className="uppercase tracking-wide text-xs bg-[#66A6B2] text-white">
                        {course.language}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {uniquePlaylists.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No playlists available for this course.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {uniquePlaylists.map((pid, i) => {
                            const list = playlistMap[pid] || [];
                            // Use first video as thumbnail
                            const thumb = list[0]?.thumbnail || "";
                            return (
                              <button
                                key={pid}
                                className="flex flex-col items-center bg-[#26667F]/90 hover:bg-[#26667F] rounded-lg p-2 text-white w-36 transition"
                                onClick={() => {
                                  setActivePlaylist({ courseId: course.id, playlistId: pid });
                                  setSelectedVideoId(list[0]?.videoId || "");
                                }}
                              >
                                {thumb && (
                                  <img
                                    src={thumb}
                                    alt="Playlist thumbnail"
                                    className="w-full h-20 object-cover rounded mb-1"
                                  />
                                )}
                                <span className="font-semibold truncate w-full text-center">
                                  Playlist {i + 1}
                                </span>
                                <span className="text-xs opacity-70">
                                  {list.length > 0
                                    ? `${list.length} videos`
                                    : "Loading..."}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {/* Show the YouTube player for this course/playlist if selected */}
                      {activePlaylist &&
                        activePlaylist.courseId === course.id &&
                        playlistMap[activePlaylist.playlistId] &&
                        playlistMap[activePlaylist.playlistId].length > 0 && (
                          <div className="mt-4">
                            <YouTubePlayer
                              playlistId={activePlaylist.playlistId}
                              playlistVideos={playlistMap[activePlaylist.playlistId]}
                              initialVideoId={
                                selectedVideoId && playlistMap[activePlaylist.playlistId].some(v => v.videoId === selectedVideoId)
                                  ? selectedVideoId
                                  : playlistMap[activePlaylist.playlistId][0].videoId
                              }
                              containerId={`yt-player-${course.id}-${activePlaylist.playlistId}`}
                              user={user}
                              setActivePlaylist={setActivePlaylist}
                              setSelectedVideoId={setSelectedVideoId}
                            />
                          </div>
                        )}
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


