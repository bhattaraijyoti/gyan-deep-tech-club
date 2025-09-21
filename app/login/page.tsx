"use client";

import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setSuccess(`Successfully logged in as ${userCredential.user.email}`);
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setSuccess(`Successfully logged in as ${result.user.email}`);
    } catch (err: any) {
      setError(err.message || "Failed to login with Google.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 animate-gradient-x">
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-10 flex flex-col items-center">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
            Login to Your Account
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Please enter your credentials to continue
          </p>
        </header>

        <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-6">
          <div className="relative">
            <input
              type="email"
              id="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full border border-gray-300 rounded-lg bg-transparent px-4 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-2 text-gray-500 text-sm font-medium transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Email Address
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full border border-gray-300 rounded-lg bg-transparent px-4 pt-5 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-2 text-gray-500 text-sm font-medium transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center my-8 w-full">
          <hr className="flex-grow border-gray-300" />
          <span className="px-4 text-gray-500 font-semibold">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 font-semibold text-gray-700 shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fill="#4285f4"
              d="M533.5 278.4c0-18.7-1.5-36.7-4.4-54.2H272v102.6h146.9c-6.3 34.3-25.2 63.4-53.7 82.9v68h86.7c50.6-46.6 79.6-115.4 79.6-199.3z"
            />
            <path
              fill="#34a853"
              d="M272 544.3c72.6 0 133.6-24 178.2-65.3l-86.7-68c-24.1 16.2-55 25.8-91.5 25.8-70.4 0-130-47.6-151.4-111.4h-89.9v69.9c44.6 88.5 136.6 149 241.3 149z"
            />
            <path
              fill="#fbbc04"
              d="M120.6 325.4c-10.7-31.7-10.7-65.9 0-97.6v-69.9h-89.9c-38.7 75.5-38.7 164.9 0 240.4l89.9-72.9z"
            />
            <path
              fill="#ea4335"
              d="M272 107.7c39.5 0 75 13.6 102.9 40.2l77.2-77.2C404.8 24.1 344 0 272 0 167.3 0 75.3 60.5 30.7 149l89.9 69.9c21.4-63.8 81-111.4 151.4-111.4z"
            />
          </svg>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        {error && (
          <p className="text-red-600 mt-6 text-center font-medium">{error}</p>
        )}
        {success && (
          <p className="text-green-600 mt-6 text-center font-medium">
            {success}
          </p>
        )}
      </div>
    </main>
  );
}