"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "beginner" | "intermediate" | "advanced" | "admin"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      if (!user) {
        router.push("/join")
      }
      return
    }

    const fetchRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.id))
        if (userDoc.exists()) {
          const data = userDoc.data()
          const role = data.role || "beginner"
          setUserRole(role)

          if (requiredRole && role !== requiredRole && role !== "admin") {
            router.push("/unauthorized")
          }
        } else {
          // No Firestore profile yet → send to choose-role
          router.push("/choose-role")
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        if (!user) {
          router.push("/join")
        }
      }
    }

    fetchRole()
  }, [isLoaded, user, requiredRole, router])

  if (!isLoaded || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}