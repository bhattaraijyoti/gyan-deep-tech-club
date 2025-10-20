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
   RESPONSIVE YOUTUBE PLAYER
   =============================== */
function YouTubePlayer({ videoId, playlistId, containerId }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const validVideoId = isValidId(videoId?.trim() ?? null) ? videoId : null;
  const validPlaylistId = isValidId(playlistId?.trim() ?? null) ? playlistId : null;
  if (!validVideoId && !validPlaylistId) return null;

  useEffect(() => {
    if (!user || !isVisible || !containerRef.current) return;

    let player: any;
    const progressId = validVideoId || validPlaylistId || "unknown";
    const progressDocRef = doc(db, "users", user.uid, "progress", progressId);
    let savedTime = 0;

    const saveProgress = async () => {
      if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        if (isNaN(currentTime)) return;
        const currentVideoId = player?.getVideoData?.()?.video_id || validVideoId;
        await setDoc(
          progressDocRef,
          { time: currentTime, videoId: currentVideoId, playlistId: validPlaylistId },
          { merge: true }
        );
      }
    };

    const onPlayerReady = () => {
      const waitUntilPlayable = () => {
        try {
          const duration = player?.getDuration?.();
          if (duration && duration > 0) {
            if (savedTime > 0) {
              player.seekTo(savedTime, true);
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

      setTimeout(() => {
        if (savedTime > 0 && player?.seekTo) {
          player.seekTo(savedTime, true);
          player.pauseVideo();
        }
      }, 2000);
    };

    const onPlayerStateChange = async (event: any) => {
      if (
        event.data === window.YT.PlayerState.PAUSED ||
        event.data === window.YT.PlayerState.ENDED
      ) {
        await saveProgress();
      }
    };

    const loadPlayer = (startTime: number, videoIdToUse: string | null, playlistIdToUse: string | null) => {
      savedTime = startTime;
      try {
        const playerOptions: any = {
          height: "100%",
          width: "100%",
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
            listType: playlistIdToUse ? "playlist" : undefined,
            list: playlistIdToUse || undefined,
          },
          events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange },
        };
        if (videoIdToUse) playerOptions.videoId = videoIdToUse;

        const iframeId = `${containerId}-iframe`;
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
            console.error("YT Player init error:", err);
          }
        }, 300);
      } catch (err) {
        console.error("YT Player setup error:", err);
      }
    };

    const fetchProgressAndLoad = async () => {
      try {
        const docSnap = await getDoc(progressDocRef);
        const data = docSnap.exists() ? docSnap.data() : null;
        const time = typeof data?.time === "number" ? data.time : 0;
        loadPlayer(time, validVideoId, validPlaylistId);
      } catch {
        loadPlayer(0, validVideoId, validPlaylistId);
      }
    };

    loadYouTubeAPI().then(fetchProgressAndLoad);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (player) {
        try {
          player.destroy();
        } catch {}
      }
    };
  }, [user, isVisible, validVideoId, validPlaylistId, containerId]);

  return (
    <div
      ref={containerRef}
      className="yt-wrapper relative aspect-[16/9] w-full bg-black rounded-lg overflow-hidden flex items-center justify-center"
    >
      {loading && (
        <p className="absolute inset-0 flex items-center justify-center text-white text-sm z-10">
          Loading video...
        </p>
      )}
      {isVisible && <div id={`${containerId}-iframe`} className="yt-iframe w-full h-full" />}
    </div>
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
    return { videoId: null, playlistId: null };
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
                const validVideos = (course.videos || [])
                  .map((video) => {
                    const { videoId, playlistId } = parseYouTubeUrl(video.trim());
                    if (videoId || playlistId) return { videoId, playlistId };
                    return null;
                  })
                  .filter((v) => v !== null) as {
                  videoId: string | null;
                  playlistId: string | null;
                }[];

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
                      {validVideos.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No valid videos available for this course.
                        </p>
                      ) : (
                        validVideos.map(({ videoId, playlistId }, index) => (
                          <div key={index} className="relative min-h-[240px] sm:min-h-[260px] bg-black rounded-lg overflow-hidden">
                            <YouTubePlayer
                              containerId={`player-${course.id}-${index}`}
                              videoId={videoId}
                              playlistId={playlistId}
                            />
                          </div>
                        ))
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