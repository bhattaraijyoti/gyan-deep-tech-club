"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { getUserProfile, type UserProfile } from "@/lib/auth"
import PrivateMessaging from "@/components/chat/private-messaging"
import { Card, CardContent } from "@/components/ui/card"

export default function MessagesPage() {
  const [user] = useAuthState(auth)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((profile) => {
        setUserProfile(profile)
        setLoading(false)
      })
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <Card className="glass-card border-white/10">
          <CardContent className="p-8 text-center">
            <p className="text-white">Please log in to access messages</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <PrivateMessaging currentUser={userProfile} />
      </div>
    </div>
  )
}
