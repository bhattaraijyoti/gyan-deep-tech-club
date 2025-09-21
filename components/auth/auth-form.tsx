"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Chrome, Code2, XCircle } from "lucide-react"
import { Button } from "react-day-picker"
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"

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
    <div className="min-h-screen flex items-center justify-center ">
      <Card className="w-full max-w-md bg-white bg-opacity-90 shadow-2xl rounded-3xl p-8 sm:p-10">
        <CardHeader className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow mx-auto">
            <Code2 className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight tracking-tight">
            Welcome to Tech Club
          </CardTitle>
          <CardDescription className="text-gray-600 text-base sm:text-lg max-w-xs mx-auto px-4">
            Sign in with your Google account to access exclusive resources and tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#26667F] text-white font-semibold shadow-md hover:bg-[#3A8AA3] transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed py-3 text-lg cursor-pointer"
            size="lg"
          >
            <Chrome className="h-6 w-6" />
            {loading ? "Signing in..." : "Continue with Google"}
          </Button>
          <p className="text-xs sm:text-sm text-gray-10 text-center mt-6 max-w-xs mx-auto px-6 select-none">
            By signing in, you agree to our <a href="/terms" className="underline hover:text-black font-bold">terms of service</a> and <a href="/privacy" className="underline hover:text-black font-bold">privacy policy</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}