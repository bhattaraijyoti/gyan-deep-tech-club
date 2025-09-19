"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Crown, Star, Zap } from "lucide-react"

export default function RoleManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"))
      const usersData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        joinedAt: doc.data().joinedAt?.toDate(),
        lastActive: doc.data().lastActive?.toDate(),
      })) as UserProfile[]
      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (uid: string, newRole: UserProfile["role"]) => {
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole })
      setUsers(users.map((user) => (user.uid === uid ? { ...user, role: newRole } : user)))
    } catch (error) {
      console.error("Error updating role:", error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4" />
      case "advanced":
        return <Star className="w-4 h-4" />
      case "intermediate":
        return <Zap className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "advanced":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "intermediate":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Role Management</h2>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.uid} className="glass-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{user.name}</h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <p className="text-gray-500 text-xs">Joined {user.joinedAt?.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className={`${getRoleBadgeColor(user.role)} flex items-center gap-1`}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </Badge>

                  <Select
                    value={user.role}
                    onValueChange={(newRole: UserProfile["role"]) => updateRole(user.uid, newRole)}
                  >
                    <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      <SelectItem value="beginner" className="text-white hover:bg-white/10">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Beginner
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate" className="text-white hover:bg-white/10">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Intermediate
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced" className="text-white hover:bg-white/10">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Advanced
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" className="text-white hover:bg-white/10">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
