"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          // ✅ Fetch Firestore user directly
          const userData = await getUser(user.uid);

          if (userData?.roleType.includes("admin")) {
            setRoletype("admin");
          } else if (userData?.roleType.includes("student")) {
            setRoletype("student");
          } else {
            setRoletype(null);
          }
        } catch (error) {
          console.error("Error fetching Firestore user:", error);
          setRoletype(null);
        }
      } else {
        setRoletype(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 12, color: "#888" }}>Loading...</span>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigation />;
  }

  if (roletype === "admin") {
    return <AdminNav user={firebaseUser} />;
  }

  if (roletype === "student") {
    return <UserNav user={firebaseUser} />;
  }

  return <Navigation />;
}
