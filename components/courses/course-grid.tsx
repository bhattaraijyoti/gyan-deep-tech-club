import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Users, Play, Star } from "lucide-react"
import Link from "next/link"

interface CourseGridProps {
  role: "beginner" | "intermediate" | "advanced"
}

export function CourseGrid({ role }: CourseGridProps) {
  // Mock course data with more detailed information
  const getCourses = (role: string) => {
    const courses = {
      beginner: [
        {
          id: "intro-programming",
          title: "Introduction to Programming",
          description: "Learn the fundamentals of programming with Python. Perfect for complete beginners.",
          instructor: "Dr. Sarah Johnson",
          rating: 4.8,
          students: 1245,
          duration: "6 weeks",
          lessons: 24,
          level: "Beginner",
          tags: ["Python", "Fundamentals", "Logic"],
          progress: 65,
          image: "/programming-basics.png",
          price: "Free",
        },
        {
          id: "web-fundamentals",
          title: "Web Development Fundamentals",
          description: "Master HTML, CSS, and JavaScript to build your first websites.",
          instructor: "Mike Chen",
          rating: 4.7,
          students: 892,
          duration: "8 weeks",
          lessons: 32,
          level: "Beginner",
          tags: ["HTML", "CSS", "JavaScript"],
          progress: 30,
          image: "/web-development-concept.png",
          price: "Free",
        },
        {
          id: "git-basics",
          title: "Git and Version Control",
          description: "Learn version control with Git and collaborate effectively with teams.",
          instructor: "Alex Rodriguez",
          rating: 4.9,
          students: 567,
          duration: "3 weeks",
          lessons: 16,
          level: "Beginner",
          tags: ["Git", "GitHub", "Collaboration"],
          progress: 0,
          image: "/git-version-control.png",
          price: "Free",
        },
      ],
      intermediate: [
        {
          id: "react-development",
          title: "React Development Mastery",
          description: "Build modern, interactive web applications with React and its ecosystem.",
          instructor: "Emma Wilson",
          rating: 4.8,
          students: 743,
          duration: "10 weeks",
          lessons: 40,
          level: "Intermediate",
          tags: ["React", "Hooks", "State Management"],
          progress: 45,
          image: "/react-development-concept.png",
          price: "Premium",
        },
        {
          id: "database-design",
          title: "Database Design & SQL",
          description: "Master database design principles and advanced SQL queries.",
          instructor: "David Kim",
          rating: 4.6,
          students: 456,
          duration: "8 weeks",
          lessons: 28,
          level: "Intermediate",
          tags: ["SQL", "Database", "Optimization"],
          progress: 20,
          image: "/database-design-concept.png",
          price: "Premium",
        },
        {
          id: "api-development",
          title: "RESTful API Development",
          description: "Build robust APIs with Node.js, Express, and best practices.",
          instructor: "Lisa Park",
          rating: 4.7,
          students: 334,
          duration: "9 weeks",
          lessons: 36,
          level: "Intermediate",
          tags: ["Node.js", "Express", "REST"],
          progress: 0,
          image: "/api-development.png",
          price: "Premium",
        },
      ],
      advanced: [
        {
          id: "system-architecture",
          title: "System Architecture & Design",
          description: "Design scalable, distributed systems and microservices architecture.",
          instructor: "Prof. James Miller",
          rating: 4.9,
          students: 234,
          duration: "12 weeks",
          lessons: 48,
          level: "Advanced",
          tags: ["Architecture", "Microservices", "Scalability"],
          progress: 25,
          image: "/system-architecture.png",
          price: "Premium",
        },
        {
          id: "machine-learning",
          title: "Machine Learning Fundamentals",
          description: "Introduction to ML algorithms, data science, and practical applications.",
          instructor: "Dr. Rachel Green",
          rating: 4.8,
          students: 189,
          duration: "14 weeks",
          lessons: 56,
          level: "Advanced",
          tags: ["ML", "Python", "Data Science"],
          progress: 10,
          image: "/machine-learning-concept.png",
          price: "Premium",
        },
        {
          id: "devops-cloud",
          title: "DevOps & Cloud Computing",
          description: "Master deployment, CI/CD, and cloud infrastructure management.",
          instructor: "Tom Anderson",
          rating: 4.7,
          students: 156,
          duration: "11 weeks",
          lessons: 44,
          level: "Advanced",
          tags: ["DevOps", "AWS", "Docker"],
          progress: 0,
          image: "/devops-cloud.png",
          price: "Premium",
        },
      ],
    }
    return courses[role] || []
  }

  const courses = getCourses(role)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card
          key={course.id}
          className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur-sm"
        >
          <div className="aspect-video bg-muted rounded-t-lg overflow-hidden relative">
            <img
              src={course.image || "/placeholder.svg"}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              <Badge className={`${course.price === "Free" ? "bg-green-500" : "bg-accent"} text-white`}>
                {course.price}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                {course.level}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Course Title & Rating */}
              <div>
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">{course.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({course.students} students)</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>

              {/* Instructor */}
              <p className="text-sm text-foreground font-medium">By {course.instructor}</p>

              {/* Course Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{course.students}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Progress (if started) */}
              {course.progress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}

              {/* Action Button */}
              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:animate-glow"
              >
                <Link href={`/courses/${role}/${course.id}`}>
                  <Play className="w-4 h-4 mr-2" />
                  {course.progress > 0 ? "Continue Learning" : "Start Course"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
