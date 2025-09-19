import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Clock, BookOpen } from "lucide-react"

interface ProgressOverviewProps {
  role: "beginner" | "intermediate" | "advanced"
}

export function ProgressOverview({ role }: ProgressOverviewProps) {
  // Mock progress data based on role
  const getProgressData = (role: string) => {
    const data = {
      beginner: {
        completedCourses: 2,
        totalCourses: 5,
        hoursLearned: 24,
        streak: 7,
        overallProgress: 40,
      },
      intermediate: {
        completedCourses: 4,
        totalCourses: 8,
        hoursLearned: 56,
        streak: 12,
        overallProgress: 50,
      },
      advanced: {
        completedCourses: 6,
        totalCourses: 10,
        hoursLearned: 89,
        streak: 18,
        overallProgress: 60,
      },
    }
    return data[role] || data.beginner
  }

  const progress = getProgressData(role)

  const stats = [
    {
      title: "Courses Completed",
      value: `${progress.completedCourses}/${progress.totalCourses}`,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      title: "Hours Learned",
      value: progress.hoursLearned.toString(),
      icon: Clock,
      color: "text-accent",
    },
    {
      title: "Learning Streak",
      value: `${progress.streak} days`,
      icon: Target,
      color: "text-chart-2",
    },
    {
      title: "Overall Progress",
      value: `${progress.overallProgress}%`,
      icon: Trophy,
      color: "text-chart-1",
    },
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span>Learning Progress</span>
        </CardTitle>
        <CardDescription>Track your learning journey and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{progress.overallProgress}%</span>
          </div>
          <Progress value={progress.overallProgress} className="h-3" />
          <p className="text-xs text-muted-foreground">
            Keep up the great work! You're making excellent progress in your {role} journey.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
