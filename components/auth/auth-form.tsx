"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Chrome, XCircle } from "lucide-react";
import { Button } from "react-day-picker";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        router.push("/user"); // redirect if already signed in
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ---------------- CREATE FIRESTORE USER ONLY IF NOT EXIST ----------------
  const createUserDocument = async (user: any) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      const now = new Date().toISOString();
      const userData = {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email,
        photoURL: user.photoURL || "",
        createdAt: now,
        lastActive: now,
        provider: user.providerData[0]?.providerId || "google",
        roleType: ["student"], // default role only for new users
      };
      try {
        await setDoc(userRef, userData, { merge: true });
        console.log("✅ User created with default role");
      } catch (err) {
        console.error("Error creating user document:", err);
      }
    } else {
      // Existing user: update lastActive
      try {
        await updateDoc(userRef, { lastActive: new Date().toISOString() });
        console.log("🔄 Existing user logged in, roles preserved:", docSnap.data()?.roleType);
      } catch (err) {
        console.error("Error updating lastActive:", err);
      }
    }
  };

  // ---------------- GOOGLE SIGNUP / LOGIN ----------------
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user) throw new Error("No user returned from Google.");

      setUser(user);

      // ✅ Only create Firestore doc if missing, do NOT overwrite roles
      await createUserDocument(user);

      setSuccess("Signed in successfully! Redirecting...");
      router.push("/user");
    } catch (err: any) {
      console.error("Google signup error:", err);
      switch (err.code) {
        case "auth/popup-closed-by-user":
          setError("Sign-in cancelled. Please try again.");
          break;
        case "auth/popup-blocked":
          setError("Popup was blocked. Please allow popups and try again.");
          break;
        case "auth/account-exists-with-different-credential":
          setError("An account already exists with this email using a different sign-in method.");
          break;
        default:
          setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md bg-white bg-opacity-90 shadow-2xl rounded-3xl p-8 sm:p-10">
        <CardHeader className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto">
            <Chrome className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome to Tech Club
          </CardTitle>
          <CardDescription className="text-gray-600 text-base sm:text-lg max-w-xs mx-auto px-4">
            Sign in with your Google account to access exclusive resources and tools
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="w-5 h-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default">
              <CheckCircle className="w-5 h-5" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#26667F] text-white font-semibold shadow-md hover:bg-[#3A8AA3] transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed py-3 text-lg cursor-pointer"
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </Button>

          <p className="text-xs sm:text-sm text-gray-500 text-center mt-6 max-w-xs mx-auto px-6 select-none">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline hover:text-black font-bold">
              terms of service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-black font-bold">
              privacy policy
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
