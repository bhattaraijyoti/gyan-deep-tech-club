// lib/firestore.ts
import { adminDb } from "./firebase-admin"; // Firestore instance from Firebase Admin
const db = adminDb;

// Default progress levels
export type ProgressLevel = "beginner" | "intermediate" | "advanced";

// Role types
export type RoleType = "student" | "admin";

export interface FirestoreUser {
  uid: string;
  email?: string;
  displayName?: string;
  provider?: string;
  createdAt: Date;
  roleType: RoleType;
  role: ProgressLevel[];
  progress?: Record<string, any>; // track progress for courses/lessons
}

/**
 * Create a Firestore user if it doesn't exist
 */
export async function createUserIfNotExist(uid: string, email?: string, displayName?: string, provider?: string) {
  const userRef = db.collection("users").doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    const newUser: FirestoreUser = {
      uid,
      email,
      displayName,
      provider,
      createdAt: new Date(),
      roleType: "student",
      role: ["beginner"],
      progress: {},
    };
    await userRef.set(newUser);
    console.log(`Firestore user ${uid} created`);
    return newUser;
  } else {
    console.log(`Firestore user ${uid} already exists`);
    return doc.data() as FirestoreUser;
  }
}

/**
 * Update a Firestore user (fields will merge with existing data)
 */
export async function updateUser(uid: string, data: Partial<FirestoreUser>) {
  const userRef = db.collection("users").doc(uid);
  await userRef.set(data, { merge: true });
  console.log(`Firestore user ${uid} updated`);
}

/**
 * Get a Firestore user by UID
 */
export async function getUser(uid: string) {
  const userRef = db.collection("users").doc(uid);
  const doc = await userRef.get();
  if (!doc.exists) return null;
  return doc.data() as FirestoreUser;
}

/**
 * Example: Set a user’s progress level array
 */
export async function setUserRole(uid: string, role: ProgressLevel[]) {
  await updateUser(uid, { role });
}

/**
 * Add a progress level to the user's progress level array if it doesn't exist
 */
export async function addUserRole(uid: string, role: ProgressLevel) {
  const user = await getUser(uid);
  if (!user) {
    throw new Error(`User ${uid} not found`);
  }
  if (!user.role.includes(role)) {
    const updatedRoles = [...user.role, role];
    await updateUser(uid, { role: updatedRoles });
    console.log(`Role ${role} added to user ${uid}`);
  } else {
    console.log(`User ${uid} already has role ${role}`);
  }
}

/**
 * Remove a progress level from the user's progress level array if it exists
 */
export async function removeUserRole(uid: string, role: ProgressLevel) {
  const user = await getUser(uid);
  if (!user) {
    throw new Error(`User ${uid} not found`);
  }
  if (user.role.includes(role)) {
    const updatedRoles = user.role.filter(r => r !== role);
    await updateUser(uid, { role: updatedRoles });
    console.log(`Role ${role} removed from user ${uid}`);
  } else {
    console.log(`User ${uid} does not have role ${role}`);
  }
}