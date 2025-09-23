// lib/firestore.ts
import { firestore } from "@/lib/firebase"; // Firestore instance from client SDK
import { doc, getDoc, setDoc } from "firebase/firestore";

// Role types
export type RoleType = "student" | "admin";

export interface FirestoreUser {
  uid: string;
  email?: string;
  displayName?: string;
  provider?: string;
  createdAt: Date;
  roleType: RoleType[];
}

/**
 * Create a Firestore user if it doesn't exist
 */
export async function createUserIfNotExist(uid: string, email?: string, displayName?: string, provider?: string) {
  const userRef = doc(firestore, "users", uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    const newUser: FirestoreUser = {
      uid,
      email,
      displayName,
      provider,
      createdAt: new Date(),
      roleType: ["student"],
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
 * Update a Firestore user (fields will merge with existing data)
 */
export async function updateUser(uid: string, data: Partial<FirestoreUser>) {
  const userRef = doc(firestore, "users", uid);
  await setDoc(userRef, data, { merge: true });
  console.log(`Firestore user ${uid} updated`);
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