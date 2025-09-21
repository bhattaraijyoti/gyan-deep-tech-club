"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LogOut, Edit3 } from "lucide-react";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      try {
        const ref = doc(db, "progress", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProgress(snap.data().value || 0);
        } else {
          setProgress(0);
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };
    fetchProgress();
  }, [user]);

  if (!user) return <p>Loading...</p>;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/join");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex justify-center items-center py-12 px-4">
      <div className="backdrop-blur-xl bg-white/80 dark:bg-neutral-900/60 rounded-3xl shadow-2xl p-10 max-w-2xl w-full border border-white/20">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt="Profile"
              className="w-36 h-36 rounded-full border-4 border-white shadow-xl object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-primary to-secondary animate-pulse"></div>
          </div>

          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {user.displayName || 'User'}
          </h1>
          <p className="text-muted-foreground text-lg mb-8">{user.email}</p>

          {progress !== null && (
            <div className="w-full mb-10 bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 shadow-inner">
              <h2 className="text-xl font-semibold text-primary mb-4">Your Progress</h2>
              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-3 text-base font-medium text-gray-700 dark:text-gray-300">{progress}% completed</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl py-3 font-semibold shadow-lg transition-all">
              <Edit3 className="w-5 h-5" /> Edit Profile
            </Button>
            <Button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-500/90 hover:to-red-700/90 text-white rounded-xl py-3 font-semibold shadow-lg transition-all"
            >
              <LogOut className="w-5 h-5" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}