
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

const courseData = {
  beginner: [
    {
      id: "html-css-basics",
      title: "HTML & CSS Fundamentals",
      description: "Learn the building blocks of web development with HTML and CSS",
      duration: "4 weeks",
      students: 45,
      level: "Beginner",
      image: "/programming-basics.png",
    },
    {
      id: "programming-logic",
      title: "Programming Logic & Problem Solving",
      description: "Develop logical thinking and problem-solving skills for programming",
      duration: "3 weeks",
      students: 38,
      level: "Beginner",
      image: "/programming-basics.png",
    },
  ],
  intermediate: [
    {
      id: "javascript-fundamentals",
      title: "JavaScript Fundamentals",
      description: "Master JavaScript programming and DOM manipulation",
      duration: "6 weeks",
      students: 32,
      level: "Intermediate",
      image: "/web-development-concept.png",
    },
    {
      id: "react-basics",
      title: "React Development",
      description: "Build modern web applications with React and components",
      duration: "8 weeks",
      students: 28,
      level: "Intermediate",
      image: "/web-development-concept.png",
    },
  ],
  advanced: [
    {
      id: "fullstack-development",
      title: "Full-Stack Development",
      description: "Build complete web applications with modern tech stack",
      duration: "12 weeks",
      students: 18,
      level: "Advanced",
      image: "/web-development-concept.png",
    },
    {
      id: "ai-machine-learning",
      title: "AI & Machine Learning",
      description: "Explore artificial intelligence and machine learning concepts",
      duration: "10 weeks",
      students: 15,
      level: "Advanced",
      image: "/web-development-concept.png",
    },
  ],
}

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-background">
   

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-bold text-foreground">Our Courses</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your learning path and advance your tech skills with our structured course offerings
          </p>
        </div>

        <div className="space-y-16">
          {/* Beginner Courses */}
          <section>
            <div className="flex items-center space-x-3 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Beginner Level</h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Start Here
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courseData.beginner.map((course) => (
                <Card key={course.id} className="p-6 hover-lift">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {course.level}
                      </Badge>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{course.title}</h3>
                      <p className="text-muted-foreground">{course.description}</p>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/courses/beginner/${course.id}`}>
                        View Course
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Intermediate Courses */}
          <section>
            <div className="flex items-center space-x-3 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Intermediate Level</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Level Up
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courseData.intermediate.map((course) => (
                <Card key={course.id} className="p-6 hover-lift">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        {course.level}
                      </Badge>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{course.title}</h3>
                      <p className="text-muted-foreground">{course.description}</p>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/courses/intermediate/${course.id}`}>
                        View Course
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Advanced Courses */}
          <section>
            <div className="flex items-center space-x-3 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Advanced Level</h2>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Expert
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courseData.advanced.map((course) => (
                <Card key={course.id} className="p-6 hover-lift">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        {course.level}
                      </Badge>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{course.title}</h3>
                      <p className="text-muted-foreground">{course.description}</p>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/courses/advanced/${course.id}`}>
                        View Course
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-20 text-center bg-muted rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Learning?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community and begin your journey in technology. All skill levels welcome!
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8">
            <Link href="/join">
              Join the Club
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
