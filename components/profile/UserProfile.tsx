"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MultiSelector } from "@/components/ui/multi-selector"
import { doc, getDoc, updateDoc } from "firebase/firestore"
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
  const [progress, setProgress] = useState<number | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    about: "",
    skills: "",
    interests: "",
  })
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
          setUserData({
            role: data.role || "Student Member",
            joinedAt: data.joinedAt || new Date().toLocaleDateString(),
            about: data.about || "",
            skills: Array.isArray(data.skills) ? data.skills : [],
            interests: Array.isArray(data.interests) ? data.interests : [],
            achievements: data.achievements || [],
            coursesCompleted: data.coursesCompleted || 0,
            totalCourses: data.totalCourses || 0,
            lastActive: data.lastActive || "Recently",
            notificationsEnabled: data.notificationsEnabled ?? true,
          })
        } else {
          // Create default data if not existing
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
        }
        // You can compute real progress later
        setProgress(65)
        setError(null)
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
    setEditForm({
      about: userData?.about || "",
      skills: userData?.skills?.join(", ") || "",
      interests: userData?.interests?.join(", ") || "",
    })
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    try {
      const userRef = doc(db, "users", user.uid)
      const updatedSkills = editForm.skills
        ? editForm.skills.split(",").map(s => s.trim()).filter(Boolean)
        : []
      const updatedInterests = editForm.interests
        ? editForm.interests.split(",").map(i => i.trim()).filter(Boolean)
        : []

      await updateDoc(userRef, {
        about: editForm.about,
        skills: updatedSkills,
        interests: updatedInterests,
      })

      setUserData(prev =>
        prev
          ? { ...prev, about: editForm.about, skills: updatedSkills, interests: updatedInterests }
          : null
      )

      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to save profile changes.")
    }
  }

  if (loading) return <p className="text-center text-muted-foreground mt-10">Loading profile...</p>
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
                    <Button onClick={openEditProfile} variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive bg-transparent"
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

            {/* Learning Progress */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Learning Progress
                </CardTitle>
                <CardDescription>Track your journey and course completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Progress */}
                {progress !== null && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">Overall Progress</span>
                      <span className="text-sm font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{userData?.coursesCompleted || 0}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Total Courses</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{userData?.totalCourses || 0}</p>
                  </div>
                </div>
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

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userData?.achievements && userData.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {userData.achievements.map((achievement, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-2xl">{achievement.icon || "🏆"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{achievement.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Complete courses to earn achievements!</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" size="sm">
                  <Bell className="w-4 h-4" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" size="sm">
                  <Mail className="w-4 h-4" />
                  Contact Admin
                </Button>
                <Separator className="my-2" />
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm text-muted-foreground">Email Notifications</span>
                  <Badge variant={userData?.notificationsEnabled ? "default" : "secondary"}>
                    {userData?.notificationsEnabled ? "On" : "Off"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span>Completed "React Basics" module</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Started "Advanced JavaScript" course</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-chart-2" />
                    <span>Earned "Quick Learner" badge</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              value={editForm.about}
              onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <Label htmlFor="skills">Skills</Label>
            <MultiSelector
              id="skills"
              placeholder="Select or type your skills..."
              options={skillOptions}
              value={editForm.skills.split(",").map(s => s.trim()).filter(Boolean)}
              onChange={(values) => setEditForm({ ...editForm, skills: values.join(", ") })}
              allowCustom
            />
          </div>

          <div>
            <Label htmlFor="interests">Learning Interests</Label>
            <MultiSelector
              id="interests"
              placeholder="Select or type your interests..."
              options={interestOptions}
              value={editForm.interests.split(",").map(i => i.trim()).filter(Boolean)}
              onChange={(values) => setEditForm({ ...editForm, interests: values.join(", ") })}
              allowCustom
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  )
}
