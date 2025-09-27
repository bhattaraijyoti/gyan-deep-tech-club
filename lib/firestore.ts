// lib/firestore.ts
import { firestore } from "@/lib/firebase"; 
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";

// Role types
export type RoleType = "student" | "admin";

export interface FirestoreUser {
  uid: string;
  email?: string;
  displayName?: string;
  provider?: string;
  createdAt: any; // use Firestore Timestamp instead of Date
  roleType: RoleType[];
}

export interface Course {
  id?: string;
  title: string;
  description?: string;
  playlistUrl?: string;
  createdAt: any;
  createdBy: string;
}

/**
 * Create a Firestore user if it doesn't exist
 * Only called on SIGNUP, not on login
 */
export async function createUserIfNotExist(
  uid: string,
  email?: string,
  displayName?: string,
  provider?: string
) {
  const userRef = doc(firestore, "users", uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    const newUser: FirestoreUser = {
      uid,
      email,
      displayName,
      provider,
      createdAt: serverTimestamp(), // ✅ Firestore server time
      roleType: ["student"], // default role only on first signup
    };
    await setDoc(userRef, newUser);
    console.log(`Firestore user ${uid} created`);
    return newUser;
  } else {
    console.log(`Firestore user ${uid} already exists`);
    return docSnap.data() as FirestoreUser;
  }
}

/**
 * Update a Firestore user (merge fields, keeps old data)
 */
export async function updateUser(uid: string, data: Partial<FirestoreUser>) {
  const userRef = doc(firestore, "users", uid);
  await setDoc(userRef, data, { merge: true });
  console.log(`Firestore user ${uid} updated`);
}

/**
 * Add a role to a Firestore user (without overwriting existing roles)
 */
export async function addUserRole(uid: string, role: RoleType) {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, {
    roleType: arrayUnion(role),
  });
  console.log(`Role "${role}" added to user ${uid}`);
}

/**
 * Remove a role from a Firestore user
 */
export async function removeUserRole(uid: string, role: RoleType) {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, {
    roleType: arrayRemove(role),
  });
  console.log(`Role "${role}" removed from user ${uid}`);
}

/**
 * Get a Firestore user by UID
 */
export async function getUser(uid: string) {
  const userRef = doc(firestore, "users", uid);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as FirestoreUser;
}

/**
 * Create a new course
 */
export async function createCourse(course: Omit<Course, "id" | "createdAt">) {
  const coursesRef = collection(firestore, "courses");
  const docRef = await addDoc(coursesRef, {
    ...course,
    createdAt: serverTimestamp(),
  });
  console.log(`Course ${docRef.id} created`);
  return { id: docRef.id, ...course };
}

/**
 * Get all courses
 */
export async function getCourses() {
  const coursesRef = collection(firestore, "courses");
  const snapshot = await getDocs(coursesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Course[];
}

/**
 * Get a single course by ID
 */
export async function getCourseById(courseId: string) {
  const courseRef = doc(firestore, "courses", courseId);
  const docSnap = await getDoc(courseRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Course;
}

/**
 * Update a course
 */
export async function updateCourse(courseId: string, data: Partial<Course>) {
  const courseRef = doc(firestore, "courses", courseId);
  await updateDoc(courseRef, data);
  console.log(`Course ${courseId} updated`);
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string) {
  const courseRef = doc(firestore, "courses", courseId);
  await deleteDoc(courseRef);
  console.log(`Course ${courseId} deleted`);
}