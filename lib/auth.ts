import { auth, db } from "./firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"

export interface UserProfile {
  uid: string
  email: string
  name: string
  role: "beginner" | "intermediate" | "advanced" | "admin"
  joinedAt: Date
  lastActive: Date
  progress: {
    completedCourses: string[]
    currentCourse?: string
    totalPoints: number
  }
}

export const signUp = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email || "",
      name,
      role: "beginner",
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

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    // Update last active
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      lastActive: new Date(),
    })

    return userCredential.user
  } catch (error: any) {
    console.error("SignIn failed:", error)
    throw new Error(error.message || "SignIn failed")
  }
}

export const signOut = () => firebaseSignOut(auth)

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, "users", uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile
  }
  return null
}

export const updateUserRole = async (uid: string, role: UserProfile["role"]) => {
  await updateDoc(doc(db, "users", uid), { role })
}

// Sign up (or ensure profile) for Google/Clerk-authenticated users
export const signUpWithGoogle = async (
  uid: string,
  name: string,
  email: string,
  role: UserProfile["role"] = "beginner"
) => {
  try {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid,
        email: email || "",
        name,
        role,
        joinedAt: new Date(),
        lastActive: new Date(),
        progress: {
          completedCourses: [],
          totalPoints: 0,
        },
      })
    }
  } catch (error: any) {
    console.error("Google signup failed:", error)
    throw new Error(error.message || "Google signup failed")
  }
}