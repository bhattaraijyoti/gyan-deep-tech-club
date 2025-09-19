import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Home } from "lucide-react"
import Link from "next/link"

interface LessonNavigationProps {
  courseId: string
  lessonId: string
  role: "beginner" | "intermediate" | "advanced"
}

export function LessonNavigation({ courseId, lessonId, role }: LessonNavigationProps) {
  // Mock navigation data
  const currentLessonIndex = Number.parseInt(lessonId) - 1
  const totalLessons = 8
  const hasNext = currentLessonIndex < totalLessons - 1
  const hasPrevious = currentLessonIndex > 0

  return (
    <div className="flex items-center justify-between">
      {/* Back to Course */}
      <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
        <Link href={`/courses/${role}/${courseId}`} className="flex items-center space-x-2">
          <Home className="w-4 h-4" />
          <span>Back to Course</span>
        </Link>
      </Button>

      {/* Lesson Navigation */}
      <div className="flex items-center space-x-2">
        {hasPrevious ? (
          <Button asChild variant="outline">
            <Link href={`/courses/${role}/${courseId}/lessons/${currentLessonIndex}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button disabled variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        )}

        <span className="text-sm text-muted-foreground px-4">
          Lesson {Number.parseInt(lessonId)} of {totalLessons}
        </span>

        {hasNext ? (
          <Button asChild>
            <Link href={`/courses/${role}/${courseId}/lessons/${currentLessonIndex + 2}`}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <Button disabled>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
