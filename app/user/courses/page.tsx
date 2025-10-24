// --- GYAN TECH CLUB - Courses Page with Playlists & YouTube Sidebar Overlay ---
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

// Fetch playlist videos by parsing HTML (no API key)
async function fetchPlaylistVideos(playlistId: string): Promise<PlaylistVideo[]> {
  try {
    // Use CORS proxy for YouTube playlist page (for client-side demo only; use your own proxy in prod)
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    const resp = await fetch(
      "https://corsproxy.io/?" + encodeURIComponent(url)
    );
    const html = await resp.text();
    // Parse HTML to extract video IDs, titles, and thumbnails
    const videoPattern = /{"playlistVideoRenderer":(.*?)}\s*[,}]/g;
    const videos: PlaylistVideo[] = [];
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
    // If parsing failed, fallback to at least the first 10 thumbnails
    if (videos.length === 0) {
      // fallback: try to extract video IDs from URLs
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

// Load the YouTube Iframe API
let youtubeApiReadyPromise: Promise<void> | null = null;
function loadYouTubeAPI(): Promise<void> {
  if (youtubeApiReadyPromise) return youtubeApiReadyPromise;
  youtubeApiReadyPromise = new Promise<void>((resolve) => {
    if (window.YT && window.YT.Player) resolve();
    else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => resolve();
    }
  });
  return youtubeApiReadyPromise;
}

// --- YouTubePlayer with Playlist Sidebar Overlay and Sequential Playlist Playback ---
function YouTubePlayer({
  playlistId,
  playlistVideos,
  initialVideoId,
  containerId,
  user,
}: {
  playlistId: string;
  playlistVideos: PlaylistVideo[];
  initialVideoId: string;
  containerId: string;
  user: any;
}) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(initialVideoId);

  // Find current video index in playlist
  const currentIndex = playlistVideos.findIndex((v) => v.videoId === currentVideoId);

  useEffect(() => {
    setCurrentVideoId(initialVideoId);
  }, [initialVideoId]);

  // --- UseEffect: Save and restore progress per video ---
  useEffect(() => {
    let player: any;
    let savedTimes: Record<string, number> = {};
    let currentVideo = currentVideoId;
    let progressDocRef: any;

    if (!user || !containerRef.current) return;

    // Helper: get progress doc ref for a video
    const getProgressDocRef = (videoId: string) =>
      doc(db, "users", user.uid, "progress", `${playlistId}:${videoId}`);

    // Helper: save progress for a video
    const saveProgressForVideo = async (videoId: string, time: number) => {
      if (!videoId) return;
      await setDoc(
        getProgressDocRef(videoId),
        { time, videoId, playlistId },
        { merge: true }
      );
    };

    // Save progress every 5s for the current video
    const saveProgress = async () => {
      if (player && player.getCurrentTime && currentVideo) {
        const currentTime = player.getCurrentTime();
        if (isNaN(currentTime)) return;
        savedTimes[currentVideo] = currentTime;
        await saveProgressForVideo(currentVideo, currentTime);
      }
    };

    // Called when player is ready, restores progress for current video
    const onPlayerReady = () => {
      const waitUntilPlayable = () => {
        try {
          const duration = player?.getDuration?.();
          if (duration && duration > 0) {
            const seekTime = savedTimes[currentVideo] ?? 0;
            if (seekTime > 0) {
              player.seekTo(seekTime, true);
              setTimeout(() => player.pauseVideo(), 300);
            } else {
              player.pauseVideo();
            }
            setLoading(false);
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

    // Save progress on pause or end
    const onPlayerStateChange = async (event: any) => {
      if (
        event.data === window.YT.PlayerState.PAUSED ||
        event.data === window.YT.PlayerState.ENDED
      ) {
        await saveProgress();
      }
    };

    // Loads the player for a video, restoring its progress if available
    const loadPlayer = (startTime: number, videoIdToUse: string) => {
      currentVideo = videoIdToUse;
      try {
        // Prepare all video IDs in playlist order
        const allVideoIds = playlistVideos.map((v) => v.videoId);
        let videoIdIndex = allVideoIds.indexOf(videoIdToUse);
        let videoId = videoIdToUse;
        // If not found, fallback to first video
        if (videoIdIndex === -1) {
          videoIdIndex = 0;
          videoId = allVideoIds[0];
        }
        // Playlist should be all videos after the first (current) one, then wrap around
        let playlistArr: string[] = [];
        if (allVideoIds.length > 1) {
          playlistArr = [
            ...allVideoIds.slice(videoIdIndex + 1),
            ...allVideoIds.slice(0, videoIdIndex),
          ];
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
            start: startTime,
            playsinline: 1,
            origin: window.location.origin,
            enablejsapi: 1,
            playlist: playlistArr.join(","),
          },
          events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange },
        };
        const iframeId = `${containerId}-iframe`;
        // Clean up any old iframe with the same id
        const oldIframe = document.getElementById(iframeId);
        if (oldIframe) {
          oldIframe.parentNode?.removeChild(oldIframe);
        }
        // Create a new div for the player
        if (containerRef.current) {
          const newDiv = document.createElement("div");
          newDiv.id = iframeId;
          newDiv.className = "yt-iframe w-full h-full";
          containerRef.current.appendChild(newDiv);
        }
        setTimeout(() => {
          try {
            player = new window.YT.Player(iframeId, playerOptions);
            playerRef.current = player;
            const iframeEl = document.getElementById(iframeId) as HTMLIFrameElement | null;
            if (iframeEl) {
              iframeEl.setAttribute(
                "allow",
                "fullscreen; autoplay; picture-in-picture; accelerometer; clipboard-write; encrypted-media; gyroscope"
              );
              iframeEl.setAttribute("allowfullscreen", "true");
              iframeEl.setAttribute("webkitallowfullscreen", "true");
              iframeEl?.setAttribute("playsinline", "1");
              iframeEl?.setAttribute("allowfullscreen", "");
              iframeEl?.setAttribute("webkit-playsinline", "true");
            }
          } catch (err) {
            // ignore
          }
        }, 300);
      } catch {}
    };

    // Fetch progress for all videos in the playlist, then load player for current video
    const fetchAllProgressAndLoad = async () => {
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
      // Use saved time for current video if available
      const startTime = savedTimes[currentVideoId] ?? 0;
      loadPlayer(startTime, currentVideoId);
    };

    // Ensure any previous interval is cleared when switching videos
    if (intervalRef.current) clearInterval(intervalRef.current);

    loadYouTubeAPI().then(fetchAllProgressAndLoad);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (player) {
        try {
          player.destroy();
        } catch {}
      }
    };
    // eslint-disable-next-line
  }, [user, playlistId, currentVideoId, containerId, playlistVideos]);

  // Sidebar overlay (portal)
  const sidebar = showSidebar && typeof document !== "undefined"
    ? ReactDOM.createPortal(
        <div
          className="fixed top-0 right-0 h-full w-80 bg-gray-900 p-3 flex flex-col z-[9999] shadow-xl overflow-y-auto transition-transform duration-300"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-white text-lg font-semibold">Playlist</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col space-y-2">
            {playlistVideos.map((v, idx) => (
              <button
                key={v.videoId}
                onClick={() => {
                  setCurrentVideoId(v.videoId);
                  setShowSidebar(false);
                }}
                className={`flex items-center gap-2 p-2 rounded ${
                  v.videoId === currentVideoId
                    ? "bg-[#26667F]"
                    : "hover:bg-gray-700"
                } transition`}
              >
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-20 h-12 object-cover rounded"
                />
                <span className="text-white text-sm truncate">{v.title}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )
    : null;

  // Mobile playlist bar
  const mobileBar = (
    <div className="flex flex-wrap justify-center gap-2 mt-2 bg-[#1a1a1a] text-white p-2 rounded-md">
      {playlistVideos.map((v) => (
        <button
          key={v.videoId}
          onClick={() => setCurrentVideoId(v.videoId)}
          className={`flex items-center gap-2 px-2 py-1 text-sm rounded ${
            v.videoId === currentVideoId
              ? "bg-[#26667F]"
              : "bg-gray-700 hover:bg-[#1f5060]"
          } transition`}
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
  );

  return (
    <div
      ref={containerRef}
      className="yt-wrapper relative aspect-[16/9] w-full bg-black rounded-lg overflow-hidden flex items-center justify-center"
    >
      <button
        className="absolute top-3 right-3 bg-[#26667F] text-white px-3 py-1.5 rounded-md text-sm z-20 sm:top-4 sm:right-4"
        onClick={() => setShowSidebar((v) => !v)}
      >
        ▶️ Playlist
      </button>
      {sidebar}
      {loading && (
        <p className="absolute inset-0 flex items-center justify-center text-white text-sm z-10">
          Loading video...
        </p>
      )}
      <div id={`${containerId}-iframe`} className="yt-iframe w-full h-full" />
      {/* Mobile playlist bar */}
      <div className="block sm:hidden w-full">{mobileBar}</div>
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
            const vids = await fetchPlaylistVideos(pid);
            newMap[pid] = vids;
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
                                selectedVideoId ||
                                playlistMap[activePlaylist.playlistId][0].videoId
                              }
                              containerId={`yt-player-${course.id}-${activePlaylist.playlistId}`}
                              user={user}
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