import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Play, FileText, Video, Download, Lock } from "lucide-react"
import Link from "next/link"

interface LessonListProps {
  courseId: string
  role: "beginner" | "intermediate" | "advanced"
}

export function LessonList({ courseId, role }: LessonListProps) {
  // Mock lesson data
  const lessons = [
    {
      id: "1",
      title: "Introduction to Programming Concepts",
      description: "Understanding what programming is and basic concepts",
      type: "video",
      duration: "15 min",
      completed: true,
      locked: false,
    },
    {
      id: "2",
      title: "Setting Up Your Development Environment",
      description: "Installing Python and setting up your code editor",
      type: "video",
      duration: "20 min",
      completed: true,
      locked: false,
    },
    {
      id: "3",
      title: "Your First Python Program",
      description: "Writing and running your first 'Hello World' program",
      type: "text",
      duration: "10 min",
      completed: true,
      locked: false,
    },
    {
      id: "4",
      title: "Variables and Data Types",
      description: "Learning about different types of data in Python",
      type: "video",
      duration: "25 min",
      completed: false,
      locked: false,
    },
    {
      id: "5",
      title: "Working with Strings",
      description: "Manipulating text data in Python",
      type: "text",
      duration: "18 min",
      completed: false,
      locked: false,
    },
    {
      id: "6",
      title: "Numbers and Mathematical Operations",
      description: "Performing calculations and working with numbers",
      type: "video",
      duration: "22 min",
      completed: false,
      locked: false,
    },
    {
      id: "7",
      title: "Practice Exercise: Calculator",
      description: "Build a simple calculator to practice what you've learned",
      type: "file",
      duration: "30 min",
      completed: false,
      locked: false,
    },
    {
      id: "8",
      title: "Conditional Statements",
      description: "Making decisions in your code with if/else statements",
      type: "video",
      duration: "28 min",
      completed: false,
      locked: true,
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video
      case "text":
        return FileText
      case "file":
        return Download
      default:
        return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "text":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "file":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="w-5 h-5 text-primary" />
          <span>Course Lessons</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className={`
                flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200
                ${
                  lesson.locked
                    ? "bg-muted/30 border-muted cursor-not-allowed"
                    : "bg-background border-border hover:border-primary/50 hover:shadow-md"
                }
              `}
            >
              {/* Lesson Number & Status */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {index + 1}
                </div>
                {lesson.locked ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : lesson.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Lesson Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`font-medium ${lesson.locked ? "text-muted-foreground" : "text-foreground"}`}>
                    {lesson.title}
                  </h3>
                  <Badge className={getTypeColor(lesson.type)}>{lesson.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                  <span>{lesson.duration}</span>
                  {lesson.completed && <span className="text-green-600 font-medium">Completed</span>}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {lesson.locked ? (
                  <Button disabled variant="ghost" size="sm">
                    <Lock className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                    <Link href={`/courses/${role}/${courseId}/lessons/${lesson.id}`}>
                      <Play className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
