"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Course {
  id: string;
  title: string;
  language: string;
  videos: string[];
  createdAt?: any;
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

                    try {
                      const url = new URL(video);

                      if (url.searchParams.get("v")) {
                        // Single video
                        const videoId = url.searchParams.get("v");
                        embedUrl = `https://www.youtube.com/embed/${videoId}`;
                      } else if (url.searchParams.get("list")) {
                        // Playlist
                        const playlistId = url.searchParams.get("list");
                        embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
                      }
                    } catch (e) {
                      console.error("Invalid URL:", video);
                    }

                    return embedUrl ? (
                      <div key={index} className="aspect-w-16 aspect-h-9">
                        <iframe
                          src={embedUrl}
                          title={`Video ${index + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-64 rounded-md shadow"
                        ></iframe>
                      </div>
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