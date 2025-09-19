import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Users, Play, Star, Award, Zap } from "lucide-react"

interface CourseListProps {
  role: "beginner" | "intermediate" | "advanced"
}

export function CourseList({ role }: CourseListProps) {
  const getCourses = (role: string) => {
    const courses = {
      beginner: [
        {
          id: 1,
          title: "Introduction to Computers",
          description: "Learn the fundamentals of computer systems and digital literacy",
          progress: 65,
          lessons: 10,
          duration: "3 weeks",
          students: 45,
          rating: 4.8,
          difficulty: "Easy",
          image: "/programming-basics.png",
          color: "from-emerald-500 to-teal-500",
        },
        {
          id: 2,
          title: "Learn Basic HTML & CSS",
          description: "Build your first web pages with HTML and style them with CSS",
          progress: 30,
          lessons: 12,
          duration: "4 weeks",
          students: 38,
          rating: 4.9,
          difficulty: "Easy",
          image: "/web-development-concept.png",
          color: "from-blue-500 to-cyan-500",
        },
        {
          id: 3,
          title: "Getting Started with Programming (Python)",
          description: "Write your first programs and understand programming logic",
          progress: 0,
          lessons: 15,
          duration: "5 weeks",
          students: 52,
          rating: 4.7,
          difficulty: "Easy",
          image: "/git-version-control.png",
          color: "from-purple-500 to-pink-500",
        },
        {
          id: 4,
          title: "Internet Basics & Digital Tools",
          description: "Navigate the digital world and use essential online tools",
          progress: 0,
          lessons: 8,
          duration: "2 weeks",
          students: 41,
          rating: 4.6,
          difficulty: "Easy",
          image: "/programming-basics.png",
          color: "from-orange-500 to-red-500",
        },
      ],
      intermediate: [
        {
          id: 5,
          title: "Frontend Development with JavaScript",
          description: "Create interactive web applications with modern JavaScript",
          progress: 45,
          lessons: 18,
          duration: "6 weeks",
          students: 32,
          rating: 4.8,
          difficulty: "Medium",
          image: "/react-development-concept.png",
          color: "from-yellow-500 to-orange-500",
        },
        {
          id: 6,
          title: "Database Fundamentals (SQL & Firestore)",
          description: "Store and manage data with relational and NoSQL databases",
          progress: 20,
          lessons: 14,
          duration: "5 weeks",
          students: 28,
          rating: 4.7,
          difficulty: "Medium",
          image: "/database-design-concept.png",
          color: "from-green-500 to-emerald-500",
        },
        {
          id: 7,
          title: "Building Interactive Websites with React",
          description: "Master React components, hooks, and state management",
          progress: 0,
          lessons: 20,
          duration: "7 weeks",
          students: 25,
          rating: 4.9,
          difficulty: "Medium",
          image: "/api-development.png",
          color: "from-blue-500 to-purple-500",
        },
        {
          id: 8,
          title: "Git & GitHub Basics",
          description: "Version control and collaborative development workflows",
          progress: 0,
          lessons: 10,
          duration: "3 weeks",
          students: 35,
          rating: 4.8,
          difficulty: "Medium",
          image: "/git-version-control.png",
          color: "from-indigo-500 to-blue-500",
        },
      ],
      advanced: [
        {
          id: 9,
          title: "Full-Stack Development (React + Next.js + Firebase)",
          description: "Build complete web applications from frontend to backend",
          progress: 25,
          lessons: 25,
          duration: "10 weeks",
          students: 18,
          rating: 4.9,
          difficulty: "Hard",
          image: "/system-architecture.png",
          color: "from-purple-500 to-pink-500",
        },
        {
          id: 10,
          title: "Cloud & DevOps Basics (Deployment with Vercel, Firebase Hosting)",
          description: "Deploy and scale applications in the cloud",
          progress: 10,
          lessons: 16,
          duration: "6 weeks",
          students: 15,
          rating: 4.8,
          difficulty: "Hard",
          image: "/devops-cloud.png",
          color: "from-cyan-500 to-blue-500",
        },
        {
          id: 11,
          title: "AI/ML Fundamentals",
          description: "Introduction to artificial intelligence and machine learning",
          progress: 0,
          lessons: 22,
          duration: "12 weeks",
          students: 12,
          rating: 4.9,
          difficulty: "Hard",
          image: "/machine-learning-concept.png",
          color: "from-pink-500 to-rose-500",
        },
        {
          id: 12,
          title: "Building Real Projects (Team Collaboration)",
          description: "Work on real-world projects with team collaboration",
          progress: 0,
          lessons: 20,
          duration: "8 weeks",
          students: 20,
          rating: 4.7,
          difficulty: "Hard",
          image: "/system-architecture.png",
          color: "from-emerald-500 to-teal-500",
        },
      ],
    }
    return courses[role] || []
  }

  const courses = getCourses(role)

  return (
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-200">Your Courses</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Continue your learning journey</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50 overflow-hidden"
            >
              <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-t-lg overflow-hidden">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${course.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                    {course.difficulty}
                  </div>
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">{course.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{course.students}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>{course.lessons} lessons</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Progress</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{course.progress}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={course.progress} className="h-2 bg-slate-200 dark:bg-slate-700" />
                      <div
                        className={`absolute inset-0 h-2 bg-gradient-to-r ${course.color} rounded-full transition-all duration-300`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    className={`w-full bg-gradient-to-r ${course.color} hover:shadow-lg hover:shadow-purple-500/25 text-white font-semibold py-3 group-hover:scale-105 transition-all duration-300 border-0`}
                    size="sm"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {course.progress > 0 ? <Play className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      <span>{course.progress > 0 ? "Continue Learning" : "Start Course"}</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
