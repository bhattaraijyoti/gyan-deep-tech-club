// lib/auth.ts
import { auth, firestore } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";

// --------------------- TYPES ---------------------
export type RoleType = "student" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  roleType: RoleType[];
  joinedAt: any;
  lastActive: any;
}

// --------------------- SIGN OUT ---------------------
export const signOutUser = () => auth.signOut();

// --------------------- GET USER PROFILE ---------------------
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(firestore, "users", uid);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as UserProfile;
};

// --------------------- UPDATE LAST ACTIVE ---------------------
export const updateLastActive = async (uid: string) => {
  await updateDoc(doc(firestore, "users", uid), { lastActive: serverTimestamp() });
};

// --------------------- CREATE USER IF NOT EXIST ---------------------
export const createUserIfNotExist = async (
  user: User,
  name: string,
  roleType: RoleType[] = ["student"]
) => {
  const userRef = doc(firestore, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    // First-time signup: create user
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || "",
      name,
      roleType, // default role
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    });
    console.log("✅ New user created with role:", roleType);
    return { uid: user.uid, email: user.email, name, roleType };
  } else {
    // Existing user: update lastActive only
    await updateLastActive(user.uid);
    console.log("🔄 Existing user, roles preserved:", docSnap.data()?.roleType);
    return docSnap.data() as UserProfile;
  }
};

// --------------------- GOOGLE SIGNUP/LOGIN ---------------------
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Ensure user exists, but do NOT reset roles if already exists
  await createUserIfNotExist(user, user.displayName || "");

  return user;
};

// --------------------- ADD ROLE ---------------------
export const addUserRole = async (uid: string, role: RoleType) => {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, {
    roleType: arrayUnion(role),
  });
  console.log(`✅ Role "${role}" added to user ${uid}`);
};

// --------------------- REMOVE ROLE ---------------------
export const removeUserRole = async (uid: string, role: RoleType) => {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, {
    roleType: arrayRemove(role),
  });
  console.log(`✅ Role "${role}" removed from user ${uid}`);
};

// --------------------- UPDATE USER ROLES (OVERWRITE) ---------------------
export const setUserRoles = async (uid: string, roles: RoleType[]) => {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, { roleType: roles });
  console.log(`✅ Roles overwritten for user ${uid}:`, roles);
};
