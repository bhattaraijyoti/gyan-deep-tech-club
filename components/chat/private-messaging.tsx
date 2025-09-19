"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Users } from "lucide-react"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
}

interface PrivateMessagingProps {
  currentUser: UserProfile
}

export default function PrivateMessaging({ currentUser }: PrivateMessagingProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      const messagesRef = collection(db, "privateMessages")
      const q = query(
        messagesRef,
        where("participants", "array-contains", currentUser.uid),
        orderBy("timestamp", "asc"),
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
          }))
          .filter(
            (msg) =>
              (msg.senderId === currentUser.uid && msg.receiverId === selectedUser.uid) ||
              (msg.senderId === selectedUser.uid && msg.receiverId === currentUser.uid),
          ) as Message[]

        setMessages(messagesData)
      })

      return () => unsubscribe()
    }
  }, [selectedUser, currentUser.uid])

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"))
      const usersData = querySnapshot.docs
        .map((doc) => ({
          ...doc.data(),
          joinedAt: doc.data().joinedAt?.toDate(),
          lastActive: doc.data().lastActive?.toDate(),
        }))
        .filter((user) => user.uid !== currentUser.uid) as UserProfile[]

      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    try {
      await addDoc(collection(db, "privateMessages"), {
        senderId: currentUser.uid,
        receiverId: selectedUser.uid,
        content: newMessage.trim(),
        timestamp: new Date(),
        read: false,
        participants: [currentUser.uid, selectedUser.uid],
      })
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400"
      case "advanced":
        return "bg-purple-500/20 text-purple-400"
      case "intermediate":
        return "bg-blue-500/20 text-blue-400"
      default:
        return "bg-green-500/20 text-green-400"
    }
  }

  return (
    <div className="flex h-[600px] gap-4">
      {/* Users List */}
      <Card className="w-1/3 glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            Select User to Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.uid}
                onClick={() => setSelectedUser(user)}
                className={`p-3 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                  selectedUser?.uid === user.uid ? "bg-purple-500/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{user.name}</p>
                    <Badge className={`${getRoleColor(user.role)} text-xs`}>{user.role}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 glass-card border-white/10">
        {selectedUser ? (
          <>
            <CardHeader className="border-b border-white/10">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg">{selectedUser.name}</p>
                  <Badge className={`${getRoleColor(selectedUser.role)} text-xs`}>{selectedUser.role}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[450px] p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser.uid ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderId === currentUser.uid
                          ? "bg-purple-500/20 text-white"
                          : "bg-white/10 text-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-60 mt-1">{message.timestamp?.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage} className="bg-purple-500 hover:bg-purple-600 text-white">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a user to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
