"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, FileText, CheckCircle, Clock } from "lucide-react"

interface LessonExampleProps {
  role: "beginner" | "intermediate" | "advanced"
  lessonId: string
}

export function LessonExample({ role, lessonId }: LessonExampleProps) {
  const getLessonContent = (role: string, lessonId: string) => {
    const lessons = {
      beginner: {
        "html-basics": {
          title: "What is HTML?",
          description: "Learn the fundamentals of HTML and create your first web page",
          videoTitle: "Building Your First Web Page",
          videoDescription: "A step-by-step guide to creating your first HTML document",
          textContent:
            "HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using elements and tags.",
          quiz: {
            question: "What does HTML stand for?",
            options: [
              "HyperText Markup Language",
              "High Tech Modern Language",
              "Home Tool Markup Language",
              "Hyperlink and Text Markup Language",
            ],
            correct: 0,
          },
          duration: "15 min",
          type: "Video + Text + Quiz",
        },
      },
      intermediate: {
        "react-components": {
          title: "React Components",
          description: "Understanding function and class components in React",
          videoTitle: "React Components Explained",
          videoDescription: "Deep dive into React component patterns and best practices",
          textContent:
            "React components are the building blocks of React applications. They let you split the UI into independent, reusable pieces.",
          project: {
            title: "Make a To-Do App",
            description: "Build a simple to-do application using React components",
            requirements: ["Create functional components", "Manage state with hooks", "Handle user interactions"],
          },
          duration: "25 min",
          type: "Video + Text + Project",
        },
      },
      advanced: {
        "vercel-deployment": {
          title: "Deploying a Next.js App on Vercel",
          description: "Learn how to deploy and manage Next.js applications on Vercel",
          videoTitle: "Walkthrough of deployment",
          videoDescription: "Complete deployment process from development to production",
          textContent:
            "Vercel provides the best developer experience for deploying Next.js applications with zero configuration.",
          task: {
            title: "Deploy your own app",
            description: "Deploy a Next.js application to Vercel and configure custom domain",
            steps: [
              "Connect GitHub repository",
              "Configure build settings",
              "Set up custom domain",
              "Monitor deployment",
            ],
          },
          duration: "30 min",
          type: "Video + Text + Task",
        },
      },
    }
    return lessons[role]?.[lessonId] || null
  }

  const lesson = getLessonContent(role, lessonId)

  if (!lesson) {
    return <div>Lesson not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Lesson Header */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-foreground">{lesson.title}</CardTitle>
              <CardDescription className="text-lg">{lesson.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {lesson.type}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {lesson.duration}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Video Section */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5 text-primary" />
            <span>{lesson.videoTitle}</span>
          </CardTitle>
          <CardDescription>{lesson.videoDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Video Player</p>
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Play className="w-4 h-4 mr-2" />
                Play Video
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Content */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-accent" />
            <span>Lesson Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">{lesson.textContent}</p>

            {role === "beginner" && lesson.quiz && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-3">Quick Quiz</h4>
                <p className="text-foreground mb-3">{lesson.quiz.question}</p>
                <div className="space-y-2">
                  {lesson.quiz.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left bg-transparent"
                      onClick={() => {}}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {role === "intermediate" && lesson.project && (
              <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <h4 className="font-semibold text-foreground mb-3">Project: {lesson.project.title}</h4>
                <p className="text-muted-foreground mb-3">{lesson.project.description}</p>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {lesson.project.requirements.map((req, index) => (
                      <li key={index} className="text-muted-foreground">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {role === "advanced" && lesson.task && (
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-3">Task: {lesson.task.title}</h4>
                <p className="text-muted-foreground mb-3">{lesson.task.description}</p>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Steps:</p>
                  <div className="space-y-2">
                    {lesson.task.steps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline">Previous Lesson</Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Next Lesson</Button>
      </div>
    </div>
  )
}
