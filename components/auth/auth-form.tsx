"use client"

import type React from "react"
import { useState } from "react"
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, XCircle } from "lucide-react"

interface ValidationState {
  email: boolean
  password: boolean
  name: boolean
}

export default function AuthForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [validation, setValidation] = useState<ValidationState>({
    email: false,
    password: false,
    name: false,
  })

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(password)
  const validateName = (name: string) => name.trim().length >= 2

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    if (field === "email") setValidation((prev) => ({ ...prev, email: validateEmail(value) }))
    if (field === "password") setValidation((prev) => ({ ...prev, password: validatePassword(value) }))
    if (field === "name") setValidation((prev) => ({ ...prev, name: validateName(value) }))
  }

  const createUserDocument = async (user: any, additionalData = {}) => {
    if (!user) return
    const userRef = doc(db, "users", user.uid)
    const userData = {
      uid: user.uid,
      displayName: user.displayName || formData.name,
      email: user.email,
      createdAt: new Date().toISOString(),
      provider: user.providerData[0]?.providerId || "email",
      roleType: ["student"],
      role: ["beginner"],
      ...additionalData,
    }
    try {
      await setDoc(userRef, userData, { merge: true })
    } catch (error) {
      console.error("Error creating user document:", error)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!validation.name || !validation.email || !validation.password) {
      setError("Please fill in all fields correctly")
      setLoading(false)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      await updateProfile(userCredential.user, { displayName: formData.name })
      await createUserDocument(userCredential.user, { displayName: formData.name, roleType: ["student"] })
      setSuccess("Account created successfully! Welcome aboard!")
      setFormData({ name: "", email: "", password: "", confirmPassword: "" })
      setValidation({ email: false, password: false, name: false })
    } catch (error: any) {
      console.error("Signup error:", error)
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please use a different email or try logging in.")
          break
        case "auth/weak-password":
          setError("Password is too weak. Please choose a stronger password.")
          break
        case "auth/invalid-email":
          setError("Please enter a valid email address.")
          break
        case "auth/operation-not-allowed":
          setError("Email/password accounts are not enabled. Please contact support.")
          break
        default:
          setError("Failed to create account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      if (!user) throw new Error("No user returned from Google.")

      // Create Firestore document
      await createUserDocument(user, { roleType: ["student"], role: ["beginner"] })

      // Sync email/password in Firebase Auth
      try {
        // Generate a temporary strong password
        const randomPassword = Math.random().toString(36).slice(-12) + "A1!"
        await createUserWithEmailAndPassword(auth, user.email!, randomPassword)
        console.log("Email/password account synced with Google OAuth.")
      } catch (emailError: any) {
        if (emailError.code === "auth/email-already-in-use") {
          console.log("Email already exists. Skipping email/password creation.")
        } else {
          console.error("Error creating email/password account:", emailError)
        }
      }

      setSuccess("Account created successfully with Google! Welcome aboard!")
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-12">
      <Card className="w-full max-w-2xl p-10 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-0">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-4xl font-serif font-semibold text-gray-900 transition-colors duration-300">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-gray-600 text-base sm:text-lg max-w-xs mx-auto">
            Join us with secure authentication and get your unique ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-2">
          {error && (
            <Alert variant="destructive" className="border-destructive/20">
              <XCircle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-6">
            {/* Name, Email, Password, Confirm Password fields */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="John Doe"
                className="transition-shadow duration-300 focus:shadow-md rounded-md focus:border-primary focus:outline-none text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="example@gmail.com"
                className="transition-shadow duration-300 focus:shadow-md rounded-md focus:border-primary focus:outline-none text-lg"
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-lg">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Password"
                className="transition-shadow duration-300 focus:shadow-md rounded-md focus:border-primary focus:outline-none text-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700 transition-colors duration-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="confirmPassword" className="text-lg">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm Password"
                className="transition-shadow duration-300 focus:shadow-md rounded-md focus:border-primary focus:outline-none text-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700 transition-colors duration-300"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-md transition-colors duration-300 text-lg"
              disabled={
                loading ||
                !validation.name ||
                !validation.email ||
                !validation.password ||
                formData.password !== formData.confirmPassword
              }
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm uppercase text-gray-500 font-medium">
              <span className="bg-white px-4">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white font-semibold py-4 rounded-md shadow-md hover:from-red-500 hover:via-red-600 hover:to-red-700 transition-all duration-300"
          >
            {loading ? "Signing up..." : "Sign up with Google"}
          </Button>

          <div className="text-center text-base text-gray-700 mt-8">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors duration-300">
              Sign in here
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}