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
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

function YouTubePlayer({ videoId, playlistId }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const playerContainerId = videoId || playlistId || "player";

  useEffect(() => {
    if (!videoId && !playlistId) return;

    let player: any;
    let user = auth.currentUser;
    if (!user) return;

    const storageKey = videoId ? `video_${videoId}` : `playlist_${playlistId}`;
    const progressDocRef = doc(db, "progress", user.uid + storageKey);

    const onPlayerStateChange = async (event: any) => {
      if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
        const currentTime = player.getCurrentTime();
        try {
          await setDoc(progressDocRef, { time: currentTime }, { merge: true });
        } catch (e) {
          console.error("Error saving progress:", e);
        }
      }
    };

    const loadPlayer = async (startTime: number) => {
      player = new window.YT.Player(playerContainerId, {
        height: "360",
        width: "640",
        videoId: videoId || undefined,
        playerVars: playlistId
          ? { listType: "playlist", list: playlistId, start: startTime }
          : { start: startTime },
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
      playerRef.current = player;
    };

    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve) => {
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
    };

    const fetchProgressAndLoad = async () => {
      try {
        const docSnap = await getDoc(progressDocRef);
        const savedTime = docSnap.exists() ? docSnap.data()?.time : 0;
        await loadPlayer(savedTime || 0);
      } catch (e) {
        console.error("Error fetching progress:", e);
        await loadPlayer(0);
      }
    };

    loadYouTubeAPI().then(() => {
      fetchProgressAndLoad();
    });

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [videoId, playlistId]);

  return <div id={playerContainerId} className="w-full h-64 rounded-md shadow" />;
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
        Explore Our Courses
      </h1>
      {courses.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No courses available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold text-gray-800">{course.title}</h2>
              <p className="text-sm text-gray-500 mt-1 mb-3">
                Language: <span className="text-indigo-500 font-medium">{course.language}</span>
              </p>
              <div className="space-y-4">
                {course.videos && course.videos.length > 0 ? (
                  course.videos.map((video, index) => {
                    let embedUrl: string | null = null;
                    let videoId: string | null = null;
                    let playlistId: string | null = null;

                    try {
                      const url = new URL(video);

                      if (url.searchParams.get("v")) {
                        // Single video
                        videoId = url.searchParams.get("v");
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      } else if (url.searchParams.get("list")) {
                        // Playlist
                        playlistId = url.searchParams.get("list");
                        embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
                      }
                    } catch (e) {
                      console.error("Invalid URL:", video);
                    }

                    return embedUrl ? (
                      <YouTubePlayer
                        key={index}
                        videoId={videoId}
                        playlistId={playlistId}
                      />
                    ) : (
                      <a
                        key={index}
                        href={video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition"
                      >
                        Video {index + 1}
                      </a>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">No videos available</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}