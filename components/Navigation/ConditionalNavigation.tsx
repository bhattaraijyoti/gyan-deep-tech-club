"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { Navigation } from "./navigation";
import UserNav from "./UserNav";
import AdminNav from "./AdminNav";

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roletype, setRoletype] = useState<string[] | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          const docRef = doc(firestore, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const roleType = data.roleType;

            if (Array.isArray(roleType)) {
              console.log("Fetched roleType from Firestore:", roleType);
              setRoletype(roleType);
            } else {
              console.warn("roleType is not an array in Firestore, setting roletype to null");
              setRoletype(null);
            }
          } else {
            console.warn("No user document found in Firestore");
            setRoletype(null);
          }
        } catch (error) {
          console.error("Error fetching user roleType:", error);
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
      <div style={{ minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 12, color: "#888" }}>Loading...</span>
      </div>
    );
  }

  if (!firebaseUser) {
    console.log("No firebaseUser, rendering fallback Navigation");
    return <Navigation />;
  }

  if (pathname === "/admin") {
    if (roletype && roletype.includes("admin")) {
      console.log("Rendering AdminNav for admin user on /admin route");
      return <AdminNav user={firebaseUser} />;
    } else {
      console.log("Non-admin user trying to access /admin, rendering nothing");
      return null;
    }
  }

  console.log("Rendering UserNav for non-admin authenticated user on non-admin route");
  return <UserNav user={firebaseUser} />;
}
