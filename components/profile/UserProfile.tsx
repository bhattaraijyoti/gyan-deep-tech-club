"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import EditProfile from "./EditProfile"
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  LogOut,
  Edit3,
  Mail,
  Calendar,
  Award,
  BookOpen,
  TrendingUp,
  Bell,
  Clock,
  Target,
  Star,
  CheckCircle2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "firebase/auth"
import { toast } from "sonner"

interface UserProfileProps {
  user: User
}

interface UserData {
  role?: string
  joinedAt?: string
  about?: string
  skills?: string[]
  interests?: string[]
  achievements?: Array<{
    title: string
    date: string
    icon?: string
  }>
  coursesCompleted?: number
  totalCourses?: number
  lastActive?: string
  notificationsEnabled?: boolean
}

export default function UserProfile({ user }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [skillOptions, setSkillOptions] = useState<string[]>([])
  const [interestOptions, setInterestOptions] = useState<string[]>([])
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const skillsRef = doc(db, "options", "skills")
        const interestsRef = doc(db, "options", "interests")
        const [skillsSnap, interestsSnap] = await Promise.all([
          getDoc(skillsRef),
          getDoc(interestsRef),
        ])
        if (skillsSnap.exists()) setSkillOptions(skillsSnap.data().list || [])
        if (interestsSnap.exists()) setInterestOptions(interestsSnap.data().list || [])
      } catch (err) {
        console.error("Error fetching options:", err)
      }
    }
    fetchOptions()
  }, [])
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      setLoading(true)
      try {
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const data = userSnap.data()
          const userDataObj: UserData = {
            role: data.role || "Student Member",
            joinedAt: data.createdAt && data.createdAt.toDate
              ? data.createdAt.toDate().toISOString().split("T")[0]
              : data.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
            about: data.about || "",
            skills: Array.isArray(data.skills) ? data.skills : [],
            interests: Array.isArray(data.interests) ? data.interests : [],
            achievements: data.achievements || [],
            coursesCompleted: data.coursesCompleted || 0,
            totalCourses: data.totalCourses || 0,
            lastActive: data.lastActive || "Recently",
            notificationsEnabled: data.notificationsEnabled ?? true,
          }
          setUserData(userDataObj)
          setError(null)
        } else {
          // If user doc doesn't exist
          const defaultData = {
            role: "Student Member",
            joinedAt: new Date().toLocaleDateString(),
            about: "",
            skills: [],
            interests: [],
            achievements: [],
            coursesCompleted: 0,
            totalCourses: 0,
            lastActive: "Recently",
            notificationsEnabled: true,
          }
          await updateDoc(userRef, defaultData)
          setUserData(defaultData)
          setError(null)
        }
      } catch (err: any) {
        console.error("Error fetching profile data:", err)
        setError("Failed to load user profile.")
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [user])

  const handleLogout = async () => {
    try {
      const { auth } = await import("@/lib/firebase")
      await auth.signOut()
      router.push("/join")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Error signing out. Please try again.")
    }
  }

  const openEditProfile = () => {
    setIsEditing(true)
  }

  // Removed handleSaveProfile (editing now handled in EditProfile)

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-24 h-24 border-4 border-t-primary border-gray-200 rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-muted-foreground">Loading your profile...</p>
      </div>
    )
  if (error) return <p className="text-center text-destructive mt-10">{error}</p>
  if (!userData) return <p className="text-center text-muted-foreground mt-10">No profile found.</p>

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <Card className="mb-6 border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={user.photoURL || "/placeholder.svg?height=120&width=120&query=student+avatar"}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-primary/10 shadow-md object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2">
                  <Star className="w-4 h-4" />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">{user.displayName || "Student"}</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={openEditProfile} variant="outline" size="sm" className="gap-2 bg-transparent cursor-pointer">
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="font-medium">
                      {userData?.role || "Student Member"}
                    </Badge>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Joined {userData?.joinedAt}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Last active: {userData?.lastActive || "Recently"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {userData?.about || "No bio added yet. Share something about yourself!"}
                </p>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Skills & Technologies</CardTitle>
                <CardDescription>Technologies and tools you're proficient in</CardDescription>
              </CardHeader>
              <CardContent>
                {userData?.skills && userData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No skills added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Interests Section */}
            {userData?.interests && userData.interests.length > 0 && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Learning Interests</CardTitle>
                  <CardDescription>Areas you want to explore and learn more about</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map((interest, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="px-3 py-1.5 text-sm font-medium border-primary/30 text-primary"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Right Column - Sidebar (empty, progress/activity removed) */}
          <div className="space-y-6"></div>
        </div>
      </div>
    <EditProfile
      user={user}
      userData={userData}
      onUpdate={(newData) =>
        setUserData((prev) => (prev ? { ...prev, ...newData } : newData))
      }
      open={isEditing}
      onOpenChange={setIsEditing}
    />
    </div>
  )
}
