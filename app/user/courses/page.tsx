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

function YouTubePlayer({ videoId, playlistId, containerId }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const validVideoId = isValidId(videoId?.trim() ?? null) ? videoId : null;
  const validPlaylistId = isValidId(playlistId?.trim() ?? null) ? playlistId : null;

  if (!validVideoId && !validPlaylistId) return null;

  useEffect(() => {
    let player: any;
    const user = auth.currentUser;
    if (!user) return;
    const progressId = validVideoId || validPlaylistId || "unknown";
    const progressDocRef = doc(db, "users", user.uid, "progress", progressId);
    let savedTime = 0;

    const saveProgress = async () => {
      if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        try {
          await setDoc(
            progressDocRef,
            { time: currentTime, videoId: validVideoId, playlistId: validPlaylistId },
            { merge: true }
          );
        } catch (e) {
          console.error("Error saving progress:", e);
        }
      }
    };

    const onPlayerStateChange = async (event: any) => {
      if (
        event.data === window.YT.PlayerState.PAUSED ||
        event.data === window.YT.PlayerState.ENDED
      ) {
        await saveProgress();
      }
    };

    const onPlayerReady = () => {
      if (savedTime > 0) player.seekTo(savedTime, true);
      intervalRef.current = setInterval(saveProgress, 5000);
    };

    const loadPlayer = (startTime: number, videoIdToUse: string | null, playlistIdToUse: string | null) => {
      savedTime = startTime;
      if (!videoIdToUse && !playlistIdToUse) return;

      const playerOptions: any = {
        height: "360",
        width: "100%",
        playerVars: {},
        events: { onStateChange: onPlayerStateChange, onReady: onPlayerReady },
      };

      if (playlistIdToUse) {
        playerOptions.playerVars = { listType: "playlist", list: playlistIdToUse, start: startTime };
      } else if (videoIdToUse) {
        playerOptions.videoId = videoIdToUse;
        playerOptions.playerVars = { start: startTime };
      }

      player = new window.YT.Player(containerId, playerOptions);
      playerRef.current = player;
    };

    const fetchProgressAndLoad = async () => {
      try {
        const docSnap = await getDoc(progressDocRef);
        const data = docSnap.exists() ? docSnap.data() : null;
        const time = typeof data?.time === "number" ? data.time : 0;
        const savedVideoId = isValidId(data?.videoId) ? data.videoId : validVideoId;
        const savedPlaylistId = isValidId(data?.playlistId) ? data.playlistId : validPlaylistId;
        loadPlayer(time, savedVideoId, savedPlaylistId);
      } catch (e) {
        console.error("Error fetching progress:", e);
        loadPlayer(0, validVideoId, validPlaylistId);
      }
    };

    loadYouTubeAPI().then(fetchProgressAndLoad);

    return () => {
      if (player) player.destroy();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [validVideoId, validPlaylistId, containerId]);

  return (
    <div
      id={containerId}
      className="w-full rounded-lg shadow-md bg-black mx-auto overflow-hidden"
      style={{ aspectRatio: "16 / 9", maxWidth: "100%" }}
    />
  );
}

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

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Redirect if not signed in
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
                <Card
                  key={course.id}
                  className="hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
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
                        {validVideos.map(({ videoId, playlistId }, index) => {
                          const validVid = isValidId(videoId?.trim() ?? null) ? videoId : null;
                          const validPlay = isValidId(playlistId?.trim() ?? null) ? playlistId : null;
                          if (!validVid && !validPlay) return null;
                          return (
                            <div
                              key={index}
                              className="w-full aspect-video rounded-lg shadow-sm overflow-hidden border border-gray-200"
                            >
                              <YouTubePlayer containerId={`player-${course.id}-${index}`} videoId={validVid} playlistId={validPlay} />
                            </div>
                          );
                        })}
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