"use client";

import { useEffect, useState, useRef } from "react";
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

interface YouTubePlayerProps {
  videoId?: string | null;
  playlistId?: string | null;
  containerId: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

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

function isValidId(id: string | null | undefined): boolean {
  return !!id && /^[a-zA-Z0-9_-]+$/.test(id.trim());
}

/* ===============================
   YOUTUBE PLAYER (tracks individual video progress)
   =============================== */
function YouTubePlayer({ videoId, playlistId, containerId }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("👤 Auth state changed:", u ? u.uid : "No user");
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const validVideoId = isValidId(videoId?.trim() ?? null) ? videoId : null;
  const validPlaylistId = isValidId(playlistId?.trim() ?? null) ? playlistId : null;

  if (!validVideoId && !validPlaylistId) {
    console.warn("⚠️ Invalid video or playlist ID:", { videoId, playlistId });
    return null;
  }

  useEffect(() => {
    if (!user) {
      console.warn("⏳ Waiting for user authentication...");
      return;
    }

    let player: any;
    const progressId = validVideoId || validPlaylistId || "unknown";
    const progressDocRef = doc(db, "users", user.uid, "progress", progressId);
    let savedTime = 0;

    const saveProgress = async () => {
      if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        if (isNaN(currentTime)) return;

        // Track current video ID even in playlists
        const currentVideoId = player?.getVideoData?.()?.video_id || validVideoId;

        console.log("💾 Saving progress:", { currentVideoId, time: currentTime });
        try {
          await setDoc(
            progressDocRef,
            { 
              time: currentTime, 
              videoId: currentVideoId, 
              playlistId: validPlaylistId 
            },
            { merge: true }
          );
          console.log("✅ Saved progress for video:", currentVideoId);
        } catch (e) {
          console.error("🔥 Firestore error saving progress:", e);
        }
      }
    };

    const onPlayerStateChange = async (event: any) => {
      const stateMap: Record<number, string> = {
        [-1]: "UNSTARTED",
        [0]: "ENDED",
        [1]: "PLAYING",
        [2]: "PAUSED",
        [3]: "BUFFERING",
        [5]: "CUED",
      };
      console.log("🎬 Player state changed:", stateMap[event.data]);

      if (
        event.data === window.YT.PlayerState.PAUSED ||
        event.data === window.YT.PlayerState.ENDED
      ) {
        await saveProgress();
      }
    };

    const onPlayerReady = () => {
      console.log("✅ Player ready. Resuming from:", savedTime);
      if (savedTime > 0) player.seekTo(savedTime, true);
      player.pauseVideo();
      intervalRef.current = setInterval(saveProgress, 5000);
    };

    const loadPlayer = (startTime: number, videoIdToUse: string | null, playlistIdToUse: string | null) => {
      console.log("📺 Loading player with:", { startTime, videoIdToUse, playlistIdToUse });
      savedTime = startTime;

      // Common playerVars
      const basePlayerVars: any = {
        controls: 1,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 1,
        start: startTime,
        autoplay: 0,
      };

      const playerOptions: any = {
        height: "360",
        width: "100%",
        playerVars: {},
        events: { onStateChange: onPlayerStateChange, onReady: onPlayerReady },
      };

      if (playlistIdToUse) {
        playerOptions.playerVars = {
          ...basePlayerVars,
          listType: "playlist",
          list: playlistIdToUse,
        };
        if (videoIdToUse) playerOptions.videoId = videoIdToUse; // start specific video
      } else if (videoIdToUse) {
        playerOptions.videoId = videoIdToUse;
        playerOptions.playerVars = { ...basePlayerVars };
      }

      player = new window.YT.Player(containerId, playerOptions);
      playerRef.current = player;
    };

    const fetchProgressAndLoad = async () => {
      console.log("📂 Fetching saved progress...");
      try {
        const docSnap = await getDoc(progressDocRef);
        const data = docSnap.exists() ? docSnap.data() : null;
        const time = typeof data?.time === "number" ? data.time : 0;
        const savedVideoId = isValidId(data?.videoId) ? data.videoId : validVideoId;
        const savedPlaylistId = isValidId(data?.playlistId) ? data.playlistId : validPlaylistId;
        console.log("🕓 Existing progress data:", data);
        loadPlayer(time, savedVideoId || validVideoId, savedPlaylistId);
      } catch (e) {
        console.error("⚠️ Error fetching progress:", e);
        loadPlayer(0, validVideoId, validPlaylistId);
      }
    };

    console.log("🌐 Loading YouTube API...");
    loadYouTubeAPI().then(() => {
      console.log("✅ YouTube API ready!");
      fetchProgressAndLoad();
    });

    return () => {
      console.log("🧹 Cleaning up player and intervals...");
      if (player) player.destroy();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, validVideoId, validPlaylistId, containerId]);

  return (
    <div
      id={containerId}
      className="relative w-full bg-black rounded-lg overflow-hidden shadow-md mx-auto"
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        maxWidth: "100%",
        height: "auto",
        minHeight: "200px",
      }}
    ></div>
  );
}

/* ===============================
   PARSE YOUTUBE URL
   =============================== */
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
    return { videoId: null, playlistId: isValid(url.searchParams.get("list")) ? url.searchParams.get("list") : null };
  } catch {
    return { videoId: null, playlistId: null };
  }
}

/* ===============================
   MAIN COURSES PAGE
   =============================== */
export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace("/unauthorized");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const courseList: Course[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(courseList);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6 sm:px-10 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center max-w-4xl mx-auto space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#26667F]">Courses & Learning</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Discover a variety of courses to enhance your skills. Search and explore courses by title or language.
          </p>
        </header>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Input
            type="search"
            placeholder="Search courses by title or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#26667F]" size={48} />
            <p className="text-gray-600 text-lg">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No courses found matching your search.</p>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const validVideos = (course.videos || [])
                .map((video) => {
                  const { videoId, playlistId } = parseYouTubeUrl(video.trim());
                  if (videoId || playlistId) return { videoId: videoId ?? null, playlistId: playlistId ?? null };
                  return null;
                })
                .filter((v) => v !== null) as { videoId: string | null; playlistId: string | null }[];

              return (
                <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                    <CardTitle className="text-lg font-semibold text-[#26667F]">{course.title}</CardTitle>
                    <Badge variant="secondary" className="uppercase tracking-wide text-xs bg-[#66A6B2] text-white">
                      {course.language}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {validVideos.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No valid videos available for this course.</p>
                    ) : (
                      <div className="space-y-4">
                        {validVideos.map(({ videoId, playlistId }, index) => (
                          <div key={index} className="w-full aspect-video rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            <YouTubePlayer
                              containerId={`player-${course.id}-${index}`}
                              videoId={videoId}
                              playlistId={playlistId}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}