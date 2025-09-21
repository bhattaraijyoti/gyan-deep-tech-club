import { auth, db } from "./firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: ("beginner" | "intermediate" | "advanced")[]
  roleType: "student" | "admin"
  joinedAt: Date
  lastActive: Date
  progress: {
    completedCourses: string[]
    currentCourse?: string
    totalPoints: number
  }
}

// --------------------- EMAIL/PASSWORD SIGNUP ---------------------
export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: UserProfile["role"] = ["beginner"],
  roleType: UserProfile["roleType"] = "student"
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email || "",
      name,
      role,
      roleType,
      joinedAt: new Date(),
      lastActive: new Date(),
      progress: {
        completedCourses: [],
        totalPoints: 0,
      },
    })

    return user
  } catch (error: any) {
    console.error("Signup failed:", error)
    throw new Error(error.message || "Signup failed")
  }
}

// --------------------- EMAIL/PASSWORD SIGN-IN ---------------------
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    // Update last active timestamp
    await updateLastActive(userCredential.user.uid)

    return userCredential.user
  } catch (error: any) {
    console.error("SignIn failed:", error)
    throw new Error(error.message || "SignIn failed")
  }
}

// --------------------- SIGN OUT ---------------------
export const signOut = () => firebaseSignOut(auth)

// --------------------- GET USER PROFILE ---------------------
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, "users", uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile
  }
  return null
}

// --------------------- UPDATE USER ROLE ---------------------
export const updateUserRole = async (uid: string, role: UserProfile["role"]) => {
  await updateDoc(doc(db, "users", uid), { role })
}

// --------------------- UPDATE LAST ACTIVE ---------------------
export const updateLastActive = async (uid: string) => {
  await updateDoc(doc(db, "users", uid), { lastActive: new Date() })
}

// --------------------- GOOGLE SIGNUP/LOGIN (FIREBASE ONLY) ---------------------
export const signUpWithGoogle = async (
  role: UserProfile["role"] = ["beginner"],
  roleType: UserProfile["roleType"] = "student"
): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const now = new Date();
    if (!userSnap.exists()) {
      // New user: create Firestore profile
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || "",
        name: user.displayName || "",
        role,
        roleType,
        joinedAt: now,
        lastActive: now,
        progress: {
          completedCourses: [],
          totalPoints: 0,
        },
      });
    } else {
      // Existing user: update lastActive
      await updateLastActive(user.uid);
    }
    return user;
  } catch (error: any) {
    console.error("Google signup failed:", error);
    throw new Error(error.message || "Google signup failed");
  }
}