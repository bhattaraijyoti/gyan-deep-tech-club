import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, BookOpen, MessageSquare, TrendingUp, UserCheck, AlertTriangle } from "lucide-react"

export function AdminOverview() {
  const stats = [
    {
      title: "Total Students",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Active Courses",
      value: "24",
      change: "+3",
      icon: BookOpen,
      color: "text-accent",
    },
    {
      title: "Messages Today",
      value: "892",
      change: "+18%",
      icon: MessageSquare,
      color: "text-chart-2",
    },
    {
      title: "Completion Rate",
      value: "78%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-chart-1",
    },
  ]

  const roleDistribution = [
    { role: "Beginner", count: 687, percentage: 55, color: "bg-green-500" },
    { role: "Intermediate", count: 398, percentage: 32, color: "bg-blue-500" },
    { role: "Advanced", count: 162, percentage: 13, color: "bg-purple-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Distribution */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-primary" />
            <span>Student Role Distribution</span>
          </CardTitle>
          <CardDescription>Current distribution of students across skill levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roleDistribution.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.role}</span>
                  <span className="text-muted-foreground">
                    {item.count} students ({item.percentage}%)
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">245ms</div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2.1GB</div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
