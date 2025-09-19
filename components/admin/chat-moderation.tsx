"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, AlertTriangle, Trash2, Ban, Send } from "lucide-react"

export function ChatModeration() {
  const [newMessage, setNewMessage] = useState("")
  const [selectedUser, setSelectedUser] = useState("")

  // Mock chat data
  const recentMessages = [
    {
      id: "1",
      user: "Sarah Johnson",
      role: "intermediate",
      message: "Can someone help me with the React hooks assignment?",
      timestamp: "2 minutes ago",
      chatType: "general",
      flagged: false,
    },
    {
      id: "2",
      user: "Mike Chen",
      role: "beginner",
      message: "This is really confusing, I don't understand anything!",
      timestamp: "5 minutes ago",
      chatType: "beginner",
      flagged: true,
    },
    {
      id: "3",
      user: "Emma Wilson",
      role: "advanced",
      message: "Here's a helpful resource for async programming",
      timestamp: "10 minutes ago",
      chatType: "general",
      flagged: false,
    },
  ]

  const flaggedMessages = recentMessages.filter((msg) => msg.flagged)

  const students = [
    { id: "1", name: "Sarah Johnson", role: "intermediate" },
    { id: "2", name: "Mike Chen", role: "beginner" },
    { id: "3", name: "Emma Wilson", role: "advanced" },
    { id: "4", name: "Alex Rodriguez", role: "beginner" },
  ]

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleSendPrivateMessage = () => {
    if (!newMessage.trim() || !selectedUser) return

    // In real app, send message via API
    console.log(`Sending private message to ${selectedUser}: ${newMessage}`)
    setNewMessage("")
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Messages</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
          <TabsTrigger value="private">Send Private Message</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Chat Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Messages Today</p>
                    <p className="text-2xl font-bold text-foreground">892</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold text-foreground">156</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Flagged Messages</p>
                    <p className="text-2xl font-bold text-foreground">3</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                    <p className="text-2xl font-bold text-foreground">94%</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-chart-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Chat Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground">{message.user}</span>
                        <Badge className={getRoleBadgeColor(message.role)}>{message.role}</Badge>
                        <Badge variant="outline">{message.chatType}</Badge>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground">{message.message}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {message.flagged && <AlertTriangle className="w-4 h-4 text-destructive" />}
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span>Flagged Messages</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground">{message.user}</span>
                        <Badge className={getRoleBadgeColor(message.role)}>{message.role}</Badge>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground">{message.message}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Ban className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Send Private Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Select Student</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                <textarea
                  placeholder="Type your private message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <Button
                onClick={handleSendPrivateMessage}
                disabled={!newMessage.trim() || !selectedUser}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Private Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
