"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUser } from "@/lib/firestore"; // ✅ use your new combined firestore.ts
import { Navigation } from "./navigation";
import UserNav from "./UserNav";
import AdminNav from "./AdminNav";

export default function ConditionalNavigation() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roletype, setRoletype] = useState<"student" | "admin" | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // Start fetching user role in background without blocking UI
        getUser(user.uid)
          .then((userData) => {
            if (userData?.roleType.includes("admin")) {
              setRoletype("admin");
            } else if (userData?.roleType.includes("student")) {
              setRoletype("student");
            } else {
              setRoletype(null);
            }
          })
          .catch((error) => {
            console.error("Error fetching Firestore user:", error);
            setRoletype(null);
          });
      } else {
        setRoletype(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Navigation />;
  }

  if (!firebaseUser) {
    return <Navigation />;
  }

  // ✅ If visiting /admin, always show AdminNav
  if (pathname.startsWith("/admin")) {
    return <AdminNav user={firebaseUser} />;
  }

  // ✅ Immediately show UserNav once firebaseUser exists, regardless of role fetch
  return <UserNav user={firebaseUser} />;
}