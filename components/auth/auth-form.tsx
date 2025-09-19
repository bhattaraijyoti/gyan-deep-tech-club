"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

// Clerk
import { useSignUp, useSignIn, useUser } from "@clerk/clerk-react"

// Firebase
import { getFirestore, doc, setDoc } from "firebase/firestore"
import { auth, app } from "@/lib/firebase"

export function AuthForm() {
  const db = getFirestore(app)

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", role: "beginner" })

  const { signUp, setActive } = useSignUp()
  const { signIn } = useSignIn()
  const { user } = useUser()

  // ------------------- EMAIL/PASSWORD SIGNUP -------------------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!signupForm.name || !signupForm.email || !signupForm.password) {
        setError("Please fill in all fields")
        return
      }

      if (!signUp || !signIn) {
        throw new Error("Authentication service not available")
      }

      const clerkUser = await signUp.create({
        emailAddress: signupForm.email,
        password: signupForm.password,
        firstName: signupForm.name,
      })

      // Set role in public metadata
      await signUp.update({ publicMetadata: { role: signupForm.role } })
      await signUp.prepareEmailAddressVerification()

      // Save user to Firebase
      const userId = clerkUser.createdUserId
      if (userId) {
        await setDoc(doc(db, "users", userId), {
          name: signupForm.name,
          email: signupForm.email,
          role: signupForm.role,
          createdAt: new Date(),
        })
      }

      // Auto-login
      const signInAttempt = await signIn.create({
        identifier: signupForm.email,
        password: signupForm.password,
      })
      await setActive({ session: signInAttempt.createdSessionId })

      setSuccess(`Welcome, ${signupForm.name}! Redirecting...`)
      setSignupForm({ name: "", email: "", password: "", role: "beginner" })
      setTimeout(() => (window.location.href = "/choose-role"), 1500)
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.message || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  // ------------------- EMAIL/PASSWORD LOGIN -------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!loginForm.email || !loginForm.password) {
        setError("Please fill in all fields")
        return
      }

      if (!signIn) {
        throw new Error("SignIn service not available")
      }

      const signInAttempt = await signIn.create({
        identifier: loginForm.email,
        password: loginForm.password,
      })
      await setActive({ session: signInAttempt.createdSessionId })

      setSuccess(`Welcome back, ${loginForm.email}! Redirecting...`)
      setTimeout(() => (window.location.href = "/choose-role"), 1500)
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  // ------------------- GOOGLE SIGN-IN -------------------
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/choose-role",
        redirectUrlComplete: "/choose-role",
      })
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed")
    } finally {
      setIsLoading(false)
    }
  }

  // ------------------- SAVE GOOGLE USERS TO FIREBASE -------------------
  useEffect(() => {
    const saveGoogleUser = async () => {
      if (user && user.id) {
        const userRef = doc(db, "users", user.id)
        const docSnap = await (await import("firebase/firestore")).getDoc(userRef)
        if (!docSnap.exists()) {
          await setDoc(userRef, {
            name: user.firstName || "",
            email: user.primaryEmailAddress?.emailAddress || "",
            role: "beginner",
            createdAt: new Date(),
          })
        }
      }
    }
    saveGoogleUser()
  }, [user, db])

  // ------------------- JSX -------------------
  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">Join the Tech Revolution</CardTitle>
        <CardDescription className="text-muted-foreground">
          Start learning, teaching, and building with fellow tech enthusiasts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signup">Join Club</TabsTrigger>
            <TabsTrigger value="login">Sign In</TabsTrigger>
          </TabsList>

          {(error || success) && (
            <Alert className={`mb-4 ${success ? "border-primary bg-primary/10" : "border-destructive bg-destructive/10"}`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className={success ? "text-primary" : "text-destructive"}>
                {error || success}
              </AlertDescription>
            </Alert>
          )}

          {/* GOOGLE SIGN-IN */}
          <div className="my-4 flex justify-center">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <FcGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </Button>
          </div>

          {/* SIGNUP FORM */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Join the Club"}
              </Button>
            </form>
          </TabsContent>

          {/* LOGIN FORM */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            New members start as Beginners. Admins can upgrade your role as you progress. By joining, you agree to our community guidelines.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}