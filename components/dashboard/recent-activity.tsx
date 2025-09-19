import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, BookOpen, Users, Award } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "course",
      title: "Completed lesson",
      description: "Introduction to Variables",
      course: "Python Basics",
      time: "2 hours ago",
      icon: BookOpen,
      color: "text-primary",
    },
    {
      id: 2,
      type: "chat",
      title: "New message",
      description: "Sarah replied in General Chat",
      time: "4 hours ago",
      icon: MessageSquare,
      color: "text-accent",
    },
    {
      id: 3,
      type: "achievement",
      title: "Achievement unlocked",
      description: "First Week Streak",
      time: "1 day ago",
      icon: Award,
      color: "text-chart-1",
    },
    {
      id: 4,
      type: "course",
      title: "Started new course",
      description: "Web Development Fundamentals",
      time: "2 days ago",
      icon: BookOpen,
      color: "text-primary",
    },
    {
      id: 5,
      type: "social",
      title: "New study buddy",
      description: "Connected with Alex M.",
      time: "3 days ago",
      icon: Users,
      color: "text-chart-2",
    },
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>Stay updated with your latest activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{activity.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                {activity.course && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {activity.course}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
