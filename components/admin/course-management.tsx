"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Users, BookOpen } from "lucide-react"

export function CourseManagement() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock course data
  const courses = [
    {
      id: "1",
      title: "Introduction to Programming",
      role: "beginner",
      lessons: 24,
      students: 687,
      status: "published",
      createdAt: "2024-01-15",
      lastUpdated: "2024-03-10",
    },
    {
      id: "2",
      title: "Web Development Fundamentals",
      role: "beginner",
      lessons: 32,
      students: 543,
      status: "published",
      createdAt: "2024-01-20",
      lastUpdated: "2024-03-08",
    },
    {
      id: "3",
      title: "React Development Mastery",
      role: "intermediate",
      lessons: 40,
      students: 298,
      status: "published",
      createdAt: "2024-02-01",
      lastUpdated: "2024-03-12",
    },
    {
      id: "4",
      title: "Advanced System Architecture",
      role: "advanced",
      lessons: 48,
      students: 89,
      status: "draft",
      createdAt: "2024-03-01",
      lastUpdated: "2024-03-15",
    },
  ]

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    return status === "published"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  }

  const filteredCourses = courses.filter((course) => course.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Input placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleBadgeColor(course.role)}>{course.role}</Badge>
                    <Badge className={getStatusBadgeColor(course.status)}>{course.status}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{course.lessons} lessons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{course.students} students</span>
                </div>
              </div>

              {/* Course Dates */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Created: {course.createdAt}</p>
                <p>Updated: {course.lastUpdated}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Course Form (placeholder) */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Course Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Course title" />
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select role level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <textarea
            placeholder="Course description"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="flex items-center space-x-2">
            <Button className="bg-primary hover:bg-primary/90">Create Course</Button>
            <Button variant="outline">Save as Draft</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
