"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Navigation } from "./navigation";
import UserNav from "./UserNav";

export default function ConditionalNavigation() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
    });
    // Set loading to false if onAuthStateChanged never fires (shouldn't happen, but just in case)
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Show nothing or a minimal loader while checking auth state
    return (
      <div style={{ minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 12, color: "#888" }}>Loading...</span>
      </div>
    );
  }

  if (firebaseUser) {
    return <UserNav user={firebaseUser} />;
  }

  return <Navigation />;
}