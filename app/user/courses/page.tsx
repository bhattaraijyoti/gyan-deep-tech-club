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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Courses</h1>
      {courses.length === 0 ? (
        <p>No courses available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-xs text-gray-500 mt-1">Language: {course.language}</p>
              <div className="mt-3 space-y-2">
                {course.videos && course.videos.length > 0 ? (
                  course.videos.map((video, index) => (
                    <a
                      key={index}
                      href={video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline"
                    >
                      Video {index + 1}
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No videos available</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}