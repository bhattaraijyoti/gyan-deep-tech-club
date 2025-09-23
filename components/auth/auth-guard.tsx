"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { auth, firestore } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [userRoleTypes, setUserRoleTypes] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/join")
        return
      }
      setUserId(user.uid)

      try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          let roleTypes: string[] = []

          if (Array.isArray(data.roleType) && data.roleType.length > 0) {
            roleTypes = data.roleType
          }

          setUserRoleTypes(roleTypes)

          if (
            requiredRole &&
            !roleTypes.includes("admin")
          ) {
            router.push("/unauthorized")
          }
        } else {
          // No Firestore profile yet → send to choose-role
          router.push("/choose-role")
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        router.push("/join")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [requiredRole, router])

  if (loading || !userId || !userRoleTypes) {
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