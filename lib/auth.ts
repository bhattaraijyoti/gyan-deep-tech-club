import { auth, firestore } from "./firebase"
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"

export interface UserProfile {
  uid: string
  email: string
  name: string
  roleType: string[]
  joinedAt: Date
  lastActive: Date
}

// --------------------- SIGN OUT ---------------------
export const signOut = () => auth.signOut()

// --------------------- GET USER PROFILE ---------------------
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(firestore, "users", uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile
  }
  return null
}

// --------------------- UPDATE USER ROLE TYPE ---------------------
export const updateUserRole = async (uid: string, roleType: UserProfile["roleType"]) => {
  await updateDoc(doc(firestore, "users", uid), { roleType })
}

// --------------------- UPDATE LAST ACTIVE ---------------------
export const updateLastActive = async (uid: string) => {
  await updateDoc(doc(firestore, "users", uid), { lastActive: new Date() })
}

// --------------------- GOOGLE SIGNUP/LOGIN (FIREBASE ONLY) ---------------------
export const signUpWithGoogle = async (
  roleType: UserProfile["roleType"] = ["student"]
): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // Ensure user profile in Firestore
    await createUserIfNotExist(user, user.displayName || "", roleType);
    return user;
  } catch (error: any) {
    console.error("Google signup failed:", error);
    throw new Error(error.message || "Google signup failed");
  }
}

// --------------------- CREATE USER IF NOT EXIST ---------------------
export const createUserIfNotExist = async (
  user: User,
  name: string,
  roleType: UserProfile["roleType"] = ["student"]
) => {
  const userRef = doc(firestore, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const now = new Date();
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || "",
      name,
      roleType,
      joinedAt: now,
      lastActive: now,
    });
  } else {
    // Existing user: update lastActive
    await updateLastActive(user.uid);
  }
}