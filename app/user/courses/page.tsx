"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

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

// Singleton promise to load YouTube IFrame API
let youtubeApiReadyPromise: Promise<void> | null = null;
function loadYouTubeAPI(): Promise<void> {
  if (youtubeApiReadyPromise) {
    return youtubeApiReadyPromise;
  }
  youtubeApiReadyPromise = new Promise<void>((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        resolve();
      };
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

  // Trim and validate IDs
  const trimmedVideoId = videoId?.trim() ?? null;
  const trimmedPlaylistId = playlistId?.trim() ?? null;
  const validVideoId = isValidId(trimmedVideoId) ? trimmedVideoId : null;
  const validPlaylistId = isValidId(trimmedPlaylistId) ? trimmedPlaylistId : null;

  // Skip rendering if both IDs invalid or missing
  if (!validVideoId && !validPlaylistId) {
    return null;
  }

  useEffect(() => {
    let player: any;
    let user = auth.currentUser;
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
      if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
        await saveProgress();
      }
    };

    const onPlayerReady = () => {
      if (savedTime > 0) {
        player.seekTo(savedTime, true);
      }
      intervalRef.current = setInterval(() => {
        saveProgress();
      }, 5000);
    };

    const loadPlayer = (startTime: number, videoIdToUse: string | null, playlistIdToUse: string | null) => {
      savedTime = startTime;

      const trimmedVideoIdToUse = videoIdToUse?.trim() ?? null;
      const trimmedPlaylistIdToUse = playlistIdToUse?.trim() ?? null;
      const validVideoIdToUse = isValidId(trimmedVideoIdToUse) ? trimmedVideoIdToUse : null;
      const validPlaylistIdToUse = isValidId(trimmedPlaylistIdToUse) ? trimmedPlaylistIdToUse : null;

      if (!validVideoIdToUse && !validPlaylistIdToUse) {
        console.warn("YouTubePlayer: Both videoId and playlistId are invalid. Player will not be created.");
        return;
      }

      const playerOptions: any = {
        height: "400",
        width: "640",
        playerVars: {},
        events: {
          onStateChange: onPlayerStateChange,
          onReady: onPlayerReady,
        },
      };

      if (validPlaylistIdToUse) {
        playerOptions.playerVars = { listType: "playlist", list: validPlaylistIdToUse, start: startTime };
      } else if (validVideoIdToUse) {
        playerOptions.videoId = validVideoIdToUse;
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
        const savedVideoIdRaw = data?.videoId ?? null;
        const savedPlaylistIdRaw = data?.playlistId ?? null;

        const savedVideoId = isValidId(savedVideoIdRaw) ? savedVideoIdRaw.trim() : null;
        const savedPlaylistId = isValidId(savedPlaylistIdRaw) ? savedPlaylistIdRaw.trim() : null;

        if ((savedVideoIdRaw && !savedVideoId) || (savedPlaylistIdRaw && !savedPlaylistId)) {
          console.warn(
            `YouTubePlayer: Invalid saved progress IDs detected. videoId: "${savedVideoIdRaw}", playlistId: "${savedPlaylistIdRaw}".`
          );
        }

        const finalVideoId = savedVideoId || validVideoId;
        const finalPlaylistId = savedPlaylistId || validPlaylistId;

        if (!finalVideoId && !finalPlaylistId) {
          console.warn("YouTubePlayer: Both saved and prop videoId and playlistId are invalid. Player will not be created.");
          return;
        }

        loadPlayer(time, finalVideoId, finalPlaylistId);
      } catch (e) {
        console.error("Error fetching progress:", e);
        loadPlayer(0, validVideoId, validPlaylistId);
      }
    };

    loadYouTubeAPI().then(() => {
      fetchProgressAndLoad();
    });

    return () => {
      if (player) {
        player.destroy();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [validVideoId, validPlaylistId, containerId]);

  return (
    <div
      id={containerId}
      className="w-full sm:w-full md:w-full lg:w-[500px] xl:w-[600px] aspect-video rounded-lg shadow-lg mx-auto min-h-[360px] sm:min-h-[400px] lg:min-h-[450px] xl:min-h-[500px]"
      style={{ backgroundColor: "#000" }}
    />
  );
}

function parseYouTubeUrl(urlStr: string): { videoId: string | null; playlistId: string | null } {
  try {
    const trimmedUrlStr = urlStr.trim();
    const url = new URL(trimmedUrlStr);

    const hostname = url.hostname.toLowerCase();

    const isValidId = (id: string | null): boolean => {
      return !!id && /^[a-zA-Z0-9_-]+$/.test(id.trim());
    };

    if (hostname === "www.youtube.com" || hostname === "youtube.com") {
      const videoIdRaw = url.searchParams.get("v");
      const playlistIdRaw = url.searchParams.get("list");

      const validVideoId = isValidId(videoIdRaw) ? videoIdRaw.trim() : null;
      const validPlaylistId = isValidId(playlistIdRaw) ? playlistIdRaw.trim() : null;

      if (validVideoId && validPlaylistId) {
        return { videoId: validVideoId, playlistId: validPlaylistId };
      }
      if (validVideoId) {
        return { videoId: validVideoId, playlistId: null };
      }
      if (validPlaylistId) {
        return { videoId: null, playlistId: validPlaylistId };
      }
    }

    if (hostname === "youtu.be") {
      const videoIdRaw = url.pathname.slice(1);
      const validVideoId = isValidId(videoIdRaw) ? videoIdRaw.trim() : null;
      if (validVideoId) {
        return { videoId: validVideoId, playlistId: null };
      }
    }

    const playlistIdRaw = url.searchParams.get("list");
    if (isValidId(playlistIdRaw)) {
      return { videoId: null, playlistId: playlistIdRaw!.trim() };
    }
  } catch (e) {
    console.error("Invalid URL:", urlStr);
  }
  return { videoId: null, playlistId: null };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const courseList: Course[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
      setCourses(courseList);
    };

    fetchCourses();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
        Explore Our Courses
      </h1>
      {courses.length === 0 ? null : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const validVideos = (course.videos || [])
              .map((video) => {
                const trimmedVideo = video.trim();
                const { videoId, playlistId } = parseYouTubeUrl(trimmedVideo);
                if (videoId || playlistId) {
                  return { videoId: videoId ?? null, playlistId: playlistId ?? null };
                }
                return null;
              })
              .filter((v) => v !== null) as { videoId: string | null; playlistId: string | null }[];

            if (validVideos.length === 0) {
              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl p-6 sm:p-8 max-w-xl mx-auto shadow-lg hover:shadow-2xl hover:scale-[1.04] transition-transform duration-300 ease-in-out border border-gray-200"
                >
                  <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-700 mb-3">{course.title}</h2>
                  <p className="text-base font-medium text-gray-600">
                    Language: <span className="text-purple-600">{course.language}</span>
                  </p>
                </div>
              );
            }

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl p-6 sm:p-8 max-w-4xl mx-auto shadow-lg hover:shadow-2xl hover:scale-[1.04] transition-transform duration-300 ease-in-out border border-gray-200 flex flex-col"
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-700 mb-5">{course.title}</h2>
                <p className="text-base font-medium text-gray-600 mb-8">
                  Language: <span className="text-purple-600">{course.language}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {validVideos.map(({ videoId, playlistId }, index) => {
                    const trimmedVid = videoId?.trim() ?? null;
                    const trimmedPlay = playlistId?.trim() ?? null;
                    const validVid = isValidId(trimmedVid) ? trimmedVid : null;
                    const validPlay = isValidId(trimmedPlay) ? trimmedPlay : null;
                    if (!validVid && !validPlay) {
                      return null;
                    }
                    return (
                      <div key={index} className="w-full sm:w-full md:w-full  xl:w-[900px] aspect-video rounded-lg shadow-lg mx-auto min-h-[360px] sm:min-h-[400px] lg:min-h-[450px] xl:min-h-[500px] overflow-hidden">
                        <YouTubePlayer
                          containerId={`player-${course.id}-${index}`}
                          videoId={validVid}
                          playlistId={validPlay}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}