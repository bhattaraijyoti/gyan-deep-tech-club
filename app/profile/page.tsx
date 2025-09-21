

"use client";

import UserProfile from "@/components/profile/UserProfile";
import AdminProfile from "@/components/profile/AdminProfile";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export default function ProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }
      // Fetch role from Firestore
      const fetchRole = async () => {
        setLoading(true);
        try {
          const ref = doc(db, "roles", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.roles) && data.roles.length > 0) {
              setRole(data.roles[0]);
            } else {
              setRole("user");
            }
          } else {
            setRole("user");
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setRole("user");
        }
        setLoading(false);
      };
      fetchRole();
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!firebaseUser) return <p>User not found</p>;

  return role === "admin" ? <AdminProfile /> : <UserProfile />;
}