"use client";

import UserProfile from "@/components/profile/UserProfile";
import AdminProfile from "@/components/profile/AdminProfile";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export default function ProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [roleType, setRoleType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setRoleType(null);
        setLoading(false);
        return;
      }
      // Fetch roleType from Firestore
      const fetchRole = async () => {
        setLoading(true);
        try {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (data?.roleType) {
              setRoleType(data.roleType);
            } else {
              setRoleType("user");
            }
          } else {
            setRoleType("user");
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setRoleType("user");
        }
        setLoading(false);
      };
      fetchRole();
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-24 h-24 border-4 border-t-primary border-gray-200 rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-muted-foreground">Loading profile...</p>
      </div>
    );
  if (!firebaseUser) return <p>User not found</p>;

  return roleType === "admin" ? (
    <AdminProfile />
  ) : (
    <UserProfile user={firebaseUser} />
  );
}