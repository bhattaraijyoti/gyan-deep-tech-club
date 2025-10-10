// lib/courses.ts
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export interface VideoProgress {
  lastTime: number;
  updatedAt: any;
}

export interface Course {
  id?: string;
  title: string;
  description?: string;
  videos: string[]; // array of YouTube links
  createdAt: any;
  createdBy: string; // uid of admin who created it
  progress?: Record<string, VideoProgress>; // videoId -> progress
}

// Create a new course
export async function createCourse(course: Omit<Course, "id" | "createdAt" | "progress">) {
  const coursesRef = collection(db, "courses");
  const docRef = await addDoc(coursesRef, {
    ...course,
    progress: {}, // initialize empty progress map
    createdAt: serverTimestamp(),
  });
  return { ...course, id: docRef.id, progress: {} };
}

// Get all courses
export async function getCourses() {
  const snapshot = await getDocs(collection(db, "courses"));
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Course[];
}

// Get a single course by id
export async function getCourseById(courseId: string) {
  const docRef = doc(db, "courses", courseId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Course;
}

// Update a course
export async function updateCourse(courseId: string, data: Partial<Course>) {
  const docRef = doc(db, "courses", courseId);
  await setDoc(docRef, data, { merge: true });
}

// Update progress for a specific video in a course
export async function updateVideoProgress(
  courseId: string,
  videoId: string,
  lastTime: number
) {
  const courseRef = doc(db, "courses", courseId);
  const snap = await getDoc(courseRef);
  if (!snap.exists()) return;

  const courseData = snap.data() as Course;
  const currentProgress = courseData.progress || {};
  currentProgress[videoId] = { lastTime, updatedAt: serverTimestamp() };

  await setDoc(courseRef, { progress: currentProgress }, { merge: true });
}

// Get progress for a specific video
export async function getVideoProgress(courseId: string, videoId: string) {
  const courseRef = doc(db, "courses", courseId);
  const snap = await getDoc(courseRef);
  if (!snap.exists()) return null;

  const courseData = snap.data() as Course;
  return courseData.progress?.[videoId] || { lastTime: 0, updatedAt: null };
}