import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, BookOpen, MessageSquare, Settings, Download } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Add New Course",
      description: "Create a new course for students",
      icon: Plus,
      href: "/admin/courses/new",
      color: "bg-primary hover:bg-primary/90",
    },
    {
      title: "Manage Users",
      description: "View and edit student accounts",
      icon: Users,
      href: "/admin/users",
      color: "bg-accent hover:bg-accent/90",
    },
    {
      title: "Course Analytics",
      description: "View course performance metrics",
      icon: BookOpen,
      href: "/admin/analytics",
      color: "bg-chart-2 hover:bg-chart-2/90",
    },
    {
      title: "Chat Moderation",
      description: "Monitor chat conversations",
      icon: MessageSquare,
      href: "/admin/chats",
      color: "bg-chart-1 hover:bg-chart-1/90",
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-muted hover:bg-muted/80 text-foreground",
    },
    {
      title: "Export Data",
      description: "Download reports and analytics",
      icon: Download,
      href: "/admin/export",
      color: "bg-muted hover:bg-muted/80 text-foreground",
    },
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              asChild
              variant="ghost"
              className={`h-auto p-4 text-left justify-start ${action.color} text-white`}
            >
              <Link href={action.href}>
                <div className="flex items-center space-x-3 w-full">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm opacity-80 line-clamp-2">{action.description}</p>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
