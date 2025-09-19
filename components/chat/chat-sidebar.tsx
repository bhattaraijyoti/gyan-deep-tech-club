"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Lock, Hash } from "lucide-react"
import Link from "next/link"

export function ChatSidebar() {
  const [activeChat, setActiveChat] = useState("general")

  const chatRooms = [
    {
      id: "general",
      name: "General Chat",
      description: "Open discussion for all members",
      icon: Hash,
      href: "/chats/general",
      unread: 3,
      online: 12,
    },
    {
      id: "role",
      name: "Beginner Chat",
      description: "Chat with fellow beginners",
      icon: Users,
      href: "/chats/role",
      unread: 1,
      online: 5,
    },
    {
      id: "private",
      name: "Private Messages",
      description: "Messages from administrators",
      icon: Lock,
      href: "/chats/private",
      unread: 0,
      online: 0,
    },
  ]

  const recentChats = [
    { name: "Sarah Johnson", lastMessage: "Thanks for the help!", time: "2m ago", unread: 1 },
    { name: "Mike Chen", lastMessage: "See you in the next lesson", time: "1h ago", unread: 0 },
    { name: "Dr. Alex Rodriguez", lastMessage: "Great progress this week!", time: "3h ago", unread: 0 },
  ]

  return (
    <div className="w-80 border-r border-border bg-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Chat Rooms</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-4">
          {/* Chat Rooms */}
          <div className="space-y-2">
            {chatRooms.map((room) => (
              <Button
                key={room.id}
                asChild
                variant={activeChat === room.id ? "default" : "ghost"}
                className={`
                  w-full justify-start h-auto p-3 text-left
                  ${activeChat === room.id ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                `}
                onClick={() => setActiveChat(room.id)}
              >
                <Link href={room.href}>
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-8 h-8 bg-sidebar-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <room.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{room.name}</p>
                        {room.unread > 0 && (
                          <Badge className="bg-accent text-accent-foreground text-xs">{room.unread}</Badge>
                        )}
                      </div>
                      <p className="text-xs opacity-70 truncate">{room.description}</p>
                      {room.online > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-xs opacity-70">{room.online} online</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>

          {/* Recent Chats */}
          <div className="pt-4 border-t border-sidebar-border">
            <h3 className="text-sm font-medium text-sidebar-foreground mb-2">Recent Activity</h3>
            <div className="space-y-2">
              {recentChats.map((chat, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-sidebar-accent-foreground">
                      {chat.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">{chat.name}</p>
                      {chat.unread > 0 && (
                        <Badge className="bg-accent text-accent-foreground text-xs">{chat.unread}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-sidebar-foreground/70 truncate">{chat.lastMessage}</p>
                    <p className="text-xs text-sidebar-foreground/50">{chat.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
