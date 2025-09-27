

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

export interface Course {
  id?: string;
  title: string;
  description?: string;
  videos: string[]; // array of YouTube links
  createdAt: any;
  createdBy: string; // uid of admin who created it
}

// Create a new course
export async function createCourse(course: Omit<Course, "id" | "createdAt">) {
  const coursesRef = collection(db, "courses");
  const docRef = await addDoc(coursesRef, {
    ...course,
    createdAt: serverTimestamp(),
  });
  return { ...course, id: docRef.id };
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