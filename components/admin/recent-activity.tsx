import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, BookOpen, MessageSquare, Settings, AlertTriangle } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      id: "1",
      type: "user",
      title: "New student registered",
      description: "Alex Rodriguez joined as beginner",
      time: "5 minutes ago",
      icon: UserPlus,
      color: "text-green-600",
    },
    {
      id: "2",
      type: "course",
      title: "Course updated",
      description: "React Development Mastery - Added 2 new lessons",
      time: "1 hour ago",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      id: "3",
      type: "chat",
      title: "Message flagged",
      description: "Inappropriate content in general chat",
      time: "2 hours ago",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      id: "4",
      type: "system",
      title: "System maintenance",
      description: "Database backup completed successfully",
      time: "4 hours ago",
      icon: Settings,
      color: "text-purple-600",
    },
    {
      id: "5",
      type: "chat",
      title: "High activity",
      description: "250+ messages in beginner chat today",
      time: "6 hours ago",
      icon: MessageSquare,
      color: "text-accent",
    },
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
