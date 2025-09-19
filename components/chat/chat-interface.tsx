"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send, Paperclip, ImageIcon, Video, File, Users, Sparkles } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { FileUpload } from "./file-upload"

interface ChatInterfaceProps {
  chatType: "general" | "role" | "private"
  title: string
}

export function ChatInterface({ chatType, title }: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(12)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock messages data
  useEffect(() => {
    const mockMessages = [
      {
        id: "1",
        senderId: "user1",
        senderName: "Sarah Johnson",
        senderRole: "intermediate",
        content: "Hey everyone! Just finished the React hooks lesson. Anyone else working on it?",
        timestamp: new Date(Date.now() - 3600000),
        type: "text",
        isOwn: false,
      },
      {
        id: "2",
        senderId: "user2",
        senderName: "Mike Chen",
        senderRole: "beginner",
        content: "I'm still on the JavaScript fundamentals. The async/await concept is tricky!",
        timestamp: new Date(Date.now() - 3300000),
        type: "text",
        isOwn: false,
      },
      {
        id: "3",
        senderId: "current-user",
        senderName: "You",
        senderRole: "beginner",
        content: "Same here Mike! I found this helpful video that explains it well.",
        timestamp: new Date(Date.now() - 3000000),
        type: "text",
        isOwn: true,
      },
      {
        id: "4",
        senderId: "admin",
        senderName: "Dr. Alex Rodriguez",
        senderRole: "admin",
        content: "Great discussion everyone! Remember, practice is key. Don't hesitate to ask questions.",
        timestamp: new Date(Date.now() - 2700000),
        type: "text",
        isOwn: false,
      },
      {
        id: "5",
        senderId: "user3",
        senderName: "Emma Wilson",
        senderRole: "advanced",
        content: "Here's a code snippet that might help with async/await:",
        timestamp: new Date(Date.now() - 2400000),
        type: "text",
        isOwn: false,
      },
      {
        id: "6",
        senderId: "user3",
        senderName: "Emma Wilson",
        senderRole: "advanced",
        content: "/async-await-example.js",
        timestamp: new Date(Date.now() - 2400000),
        type: "file",
        isOwn: false,
      },
    ]

    // Filter messages based on chat type
    if (chatType === "private") {
      setMessages(
        mockMessages.filter((msg) => msg.senderRole === "admin" || msg.senderId === "current-user").slice(0, 3),
      )
    } else {
      setMessages(mockMessages)
    }
  }, [chatType])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      senderId: "current-user",
      senderName: "You",
      senderRole: "beginner",
      content: message,
      timestamp: new Date(),
      type: "text",
      isOwn: true,
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")

    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Simulate a response (in real app, this would come from WebSocket)
      if (Math.random() > 0.5) {
        const responses = [
          "That's a great question!",
          "I had the same issue. Here's what worked for me...",
          "Thanks for sharing that resource!",
          "Let me know if you need more help with that.",
        ]
        const responseMessage = {
          id: (Date.now() + 1).toString(),
          senderId: "user" + Math.floor(Math.random() * 10),
          senderName: ["Alex", "Sarah", "Mike", "Emma"][Math.floor(Math.random() * 4)],
          senderRole: ["beginner", "intermediate", "advanced"][Math.floor(Math.random() * 3)],
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: "text",
          isOwn: false,
        }
        setMessages((prev) => [...prev, responseMessage])
      }
    }, 2000)
  }

  const handleFileUpload = (file: File, type: string) => {
    const newMessage = {
      id: Date.now().toString(),
      senderId: "current-user",
      senderName: "You",
      senderRole: "beginner",
      content: file.name,
      timestamp: new Date(),
      type: type,
      isOwn: true,
      fileUrl: URL.createObjectURL(file),
    }

    setMessages((prev) => [...prev, newMessage])
    setShowFileUpload(false)
  }

  const getChatDescription = () => {
    switch (chatType) {
      case "general":
        return "Connect with all club members"
      case "role":
        return "Chat with peers at your skill level"
      case "private":
        return "Private messages from administrators"
      default:
        return ""
    }
  }

  return (
    <div className="h-full flex flex-col glass-strong rounded-3xl overflow-hidden animate-scale-in">
      <div className="glass border-b border-border/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center hover-glow">
              <MessageSquare className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">{title}</h1>
              <p className="text-muted-foreground text-lg">{getChatDescription()}</p>
            </div>
          </div>
          {chatType !== "private" && (
            <div className="flex items-center space-x-3 glass px-4 py-2 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">{onlineUsers}</span>
              </div>
              <span className="text-muted-foreground">online</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={msg.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ChatMessage message={msg} />
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-3 animate-fade-in-up">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-sm">
                    <Sparkles className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="glass px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {chatType !== "private" && (
          <div className="border-t border-border/30 p-6">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="glass border-border/30 rounded-2xl h-14 text-lg px-6 pr-16 focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-10 w-10 p-0 rounded-xl hover:bg-primary/10 transition-all duration-300"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white h-14 w-14 rounded-2xl hover-glow transition-all duration-300 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {showFileUpload && (
                <div className="glass rounded-2xl p-4 animate-scale-in">
                  <div className="flex items-center justify-center space-x-4">
                    <FileUpload onUpload={handleFileUpload} accept="image/*" type="image">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="flex flex-col items-center space-y-2 h-auto py-4 px-6 rounded-2xl hover:bg-primary/10 transition-all duration-300"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Image</span>
                      </Button>
                    </FileUpload>
                    <FileUpload onUpload={handleFileUpload} accept="video/*" type="video">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="flex flex-col items-center space-y-2 h-auto py-4 px-6 rounded-2xl hover:bg-primary/10 transition-all duration-300"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl flex items-center justify-center">
                          <Video className="w-6 h-6 text-secondary" />
                        </div>
                        <span className="text-sm font-medium">Video</span>
                      </Button>
                    </FileUpload>
                    <FileUpload onUpload={handleFileUpload} accept="*" type="file">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="flex flex-col items-center space-y-2 h-auto py-4 px-6 rounded-2xl hover:bg-primary/10 transition-all duration-300"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                          <File className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium">File</span>
                      </Button>
                    </FileUpload>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {chatType === "private" && (
          <div className="border-t border-border/30 p-6">
            <div className="glass rounded-2xl p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <p className="text-muted-foreground text-lg">
                This is a read-only chat. Only administrators can send messages here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
