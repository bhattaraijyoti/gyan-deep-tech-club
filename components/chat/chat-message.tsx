import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, ImageIcon, Video, File } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ChatMessageProps {
  message: {
    id: string
    senderId: string
    senderName: string
    senderRole: string
    content: string
    timestamp: Date
    type: "text" | "image" | "video" | "file"
    isOwn: boolean
    fileUrl?: string
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "beginner":
        return "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-700 border border-green-500/30"
      case "intermediate":
        return "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border border-blue-500/30"
      case "advanced":
        return "bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-700 border border-purple-500/30"
      case "admin":
        return "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-700 border border-red-500/30"
      default:
        return "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 border border-gray-500/30"
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return ImageIcon
      case "video":
        return Video
      case "file":
        return File
      default:
        return File
    }
  }

  const renderFileContent = () => {
    if (message.type === "image" && message.fileUrl) {
      return (
        <div className="mt-3">
          <img
            src={message.fileUrl || "/placeholder.svg"}
            alt="Shared image"
            className="max-w-xs rounded-2xl border border-border/30 cursor-pointer hover:opacity-90 transition-all duration-300 hover-lift"
          />
        </div>
      )
    }

    if (message.type === "video" && message.fileUrl) {
      return (
        <div className="mt-3">
          <video
            controls
            className="max-w-xs rounded-2xl border border-border/30 hover-lift transition-all duration-300"
            style={{ maxHeight: "200px" }}
          >
            <source src={message.fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }

    if (message.type === "file") {
      const FileIcon = getFileIcon(message.type)
      return (
        <div className="mt-3">
          <div className="glass rounded-2xl p-4 max-w-xs hover-lift transition-all duration-300 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <FileIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{message.content}</p>
                <p className="text-xs text-muted-foreground">Click to download</p>
              </div>
              <Button size="sm" variant="ghost" className="flex-shrink-0 rounded-xl hover:bg-primary/10">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className={`flex items-start space-x-4 ${message.isOwn ? "flex-row-reverse space-x-reverse" : ""} group`}>
      <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-border/30 hover:ring-primary/50 transition-all duration-300">
        <AvatarImage src={`/avatar-${message.senderId}.png`} />
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-sm font-semibold">
          {message.senderName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 min-w-0 ${message.isOwn ? "text-right" : ""}`}>
        <div className={`flex items-center space-x-3 mb-2 ${message.isOwn ? "justify-end" : ""}`}>
          <span className="text-sm font-semibold text-foreground">{message.senderName}</span>
          <Badge className={`text-xs px-3 py-1 rounded-full ${getRoleBadgeColor(message.senderRole)}`}>
            {message.senderRole}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>

        <div
          className={`
          inline-block max-w-xs lg:max-w-md p-4 rounded-2xl transition-all duration-300 hover-lift
          ${
            message.isOwn
              ? "bg-gradient-to-r from-primary to-secondary text-white"
              : message.senderRole === "admin"
                ? "glass border border-accent/30 bg-accent/10"
                : "glass border border-border/30"
          }
        `}
        >
          {message.type === "text" ? (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          ) : (
            <div>
              <p className="text-sm font-semibold mb-1">{message.content}</p>
              {renderFileContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
