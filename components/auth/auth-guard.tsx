"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "admin";
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/join");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // Firestore user doc missing → redirect to choose role
          console.log("User doc missing, redirecting to /choose-role");
          router.replace("/choose-role");
          setLoading(false);
          return;
        }

        const data = userDoc.data();
        const roles = Array.isArray(data?.roleType) ? data.roleType : [];

        if (requiredRole && !roles.includes(requiredRole)) {
          router.replace("/unauthorized");
        } else {
          setIsAuthorized(true);
        }
      } catch (err) {
        console.error("AuthGuard Error:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
