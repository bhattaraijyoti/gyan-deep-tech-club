"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export default function AuthForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        // If already signed in, redirect to dashboard
        router.push("/dashboard")
      }
    })
    return () => unsubscribe()
  }, [router])

  // Create Firestore document for the user without default role
  const createUserDocument = async (user: any, additionalData = {}) => {
    if (!user) return
    const userRef = doc(db, "users", user.uid)
    const userData = {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email,
      photoURL: user.photoURL || "",
      createdAt: new Date().toISOString(),
      provider: user.providerData[0]?.providerId || "google",
      roleType: ["student"], // user type is student
      role: [], // no default role; user chooses later
      ...additionalData,
    }
    try {
      await setDoc(userRef, userData, { merge: true })
    } catch (error) {
      console.error("Error creating user document:", error)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      if (!user) throw new Error("No user returned from Google.")

      setUser(user)

      // Create Firestore document
      await createUserDocument(user, { roleType: ["student"] })

      setSuccess("Account created successfully with Google! Welcome aboard!")
      router.push("/choose-role") // redirect to choose-role page
    } catch (error: any) {
      console.error("Google signup full error:", error)
      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Sign-up was cancelled. Please try again.")
          break
        case "auth/popup-blocked":
          setError("Popup was blocked. Please allow popups and try again.")
          break
        case "auth/account-exists-with-different-credential":
          setError("An account already exists with this email using a different sign-in method.")
          break
        default:
          setError(error.message || "Failed to sign up with Google. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="flex items-center justify-center min-h-screen px-6 py-12"
      style={{ background: "linear-gradient(135deg, #0891b2, #10b981)" }}
    >
      <div className="w-full max-w-md p-10 bg-white bg-opacity-60 backdrop-blur-md rounded-3xl shadow-lg border border-white/30">
        {user && user.photoURL && (
          <img
            src={user.photoURL}
            alt="Profile Picture"
            className="mx-auto mb-6 w-24 h-24 rounded-full object-cover"
          />
        )}
        <h1 className="text-4xl font-extrabold font-serif text-center bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-10 select-none">
          Login to Your Account
        </h1>

        {error && (
          <Alert variant="destructive" className="border-destructive/20 mb-6">
            <XCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-300 bg-green-50 text-green-900 mb-6">
            <CheckCircle className="h-5 w-5 text-green-700" />
            <AlertDescription className="text-green-900">{success}</AlertDescription>
          </Alert>
        )}

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 via-teal-600 to-emerald-600 text-white font-semibold py-4 rounded-2xl shadow-md hover:from-cyan-600 hover:via-teal-700 hover:to-emerald-700 transition-transform duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing up..." : "Continue with Google"}
        </button>
      </div>
    </main>
  )
}