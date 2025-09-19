import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Star, Clock, BookOpen, Play } from "lucide-react"
import Link from "next/link"

interface CourseHeaderProps {
  courseId: string
  role: "beginner" | "intermediate" | "advanced"
}

export function CourseHeader({ courseId, role }: CourseHeaderProps) {
  // Mock course data - in real app, fetch based on courseId
  const course = {
    title: "Introduction to Programming",
    description:
      "Learn the fundamentals of programming with Python. This comprehensive course covers everything from basic syntax to advanced concepts, preparing you for real-world development challenges.",
    instructor: "Dr. Sarah Johnson",
    rating: 4.8,
    students: 1245,
    duration: "6 weeks",
    lessons: 24,
    level: "Beginner",
    progress: 65,
    image: "/programming-basics.png",
    tags: ["Python", "Fundamentals", "Logic", "Problem Solving"],
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
        <Link href={`/courses/${role}`} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>
      </Button>

      {/* Course Header Card */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Image */}
            <div className="lg:col-span-1">
              <div className="aspect-video lg:aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Course Info */}
            <div className="lg:col-span-2 p-6 space-y-6">
              <div className="space-y-4">
                {/* Title and Level */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-primary text-primary-foreground">{course.level}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">{course.rating}</span>
                    <span className="text-muted-foreground">({course.students} students)</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>

                {/* Instructor */}
                <p className="text-foreground">
                  <span className="text-muted-foreground">Instructor:</span> {course.instructor}
                </p>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Progress */}
                {course.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="font-medium text-foreground">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-3" />
                  </div>
                )}

                {/* Action Button */}
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/courses/${role}/${courseId}/lessons/1`}>
                    <Play className="w-5 h-5 mr-2" />
                    {course.progress > 0 ? "Continue Learning" : "Start Course"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
