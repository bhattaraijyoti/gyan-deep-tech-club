import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, CheckCircle } from "lucide-react"

interface CourseProgressProps {
  courseId: string
}

export function CourseProgress({ courseId }: CourseProgressProps) {
  // Mock progress data
  const progressData = {
    completedLessons: 3,
    totalLessons: 8,
    timeSpent: "1h 25m",
    estimatedTimeLeft: "2h 15m",
    overallProgress: 37,
    nextMilestone: "Complete Variables & Data Types",
    achievements: [
      { name: "First Steps", description: "Completed your first lesson", earned: true },
      { name: "Getting Started", description: "Completed 3 lessons", earned: true },
      { name: "Quarter Way", description: "Completed 25% of the course", earned: false },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Your Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-1">{progressData.overallProgress}%</div>
            <p className="text-sm text-muted-foreground">Course Completion</p>
          </div>

          <Progress value={progressData.overallProgress} className="h-3" />

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-foreground">
                {progressData.completedLessons}/{progressData.totalLessons}
              </div>
              <p className="text-xs text-muted-foreground">Lessons</p>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{progressData.timeSpent}</div>
              <p className="text-xs text-muted-foreground">Time Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Milestone */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-accent" />
            <span>Next Milestone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-foreground font-medium">{progressData.nextMilestone}</p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Est. {progressData.estimatedTimeLeft} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-chart-1" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progressData.achievements.map((achievement, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  achievement.earned ? "bg-green-50 dark:bg-green-900/20" : "bg-muted/50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    achievement.earned ? "bg-green-500" : "bg-muted"
                  }`}
                >
                  {achievement.earned ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      achievement.earned ? "text-green-700 dark:text-green-300" : "text-muted-foreground"
                    }`}
                  >
                    {achievement.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
                {achievement.earned && <Badge className="bg-green-500 text-white">Earned</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
