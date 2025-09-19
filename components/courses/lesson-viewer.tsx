"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, FileText, Video, Download, Play, Pause, Volume2 } from "lucide-react"

interface LessonViewerProps {
  lessonId: string
  courseId: string
  role: "beginner" | "intermediate" | "advanced"
}

export function LessonViewer({ lessonId, courseId, role }: LessonViewerProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Mock lesson data
  const lesson = {
    id: lessonId,
    title: "Variables and Data Types",
    type: "video",
    duration: "25 min",
    content: {
      video: "/lesson-video.mp4",
      transcript: `
        Welcome to this lesson on Variables and Data Types in Python.
        
        In programming, variables are like containers that store data values. Think of them as labeled boxes where you can put different types of information.
        
        Python has several built-in data types:
        
        1. **Strings (str)**: Text data enclosed in quotes
           Example: name = "John"
        
        2. **Integers (int)**: Whole numbers
           Example: age = 25
        
        3. **Floats (float)**: Decimal numbers
           Example: height = 5.9
        
        4. **Booleans (bool)**: True or False values
           Example: is_student = True
        
        Let's see some examples in action...
      `,
      notes: [
        "Variables are containers for storing data values",
        "Python has dynamic typing - you don't need to declare variable types",
        "Use descriptive variable names for better code readability",
        "Python is case-sensitive: 'Name' and 'name' are different variables",
      ],
    },
  }

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

  const markAsCompleted = () => {
    setIsCompleted(true)
    // In real app, update progress in backend
  }

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                {React.createElement(getTypeIcon(lesson.type), {
                  className: "w-5 h-5 text-primary",
                })}
              </div>
              <div>
                <CardTitle className="text-xl text-foreground">{lesson.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{lesson.type}</Badge>
                  <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isCompleted && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
              {!isCompleted && (
                <Button onClick={markAsCompleted} className="bg-primary hover:bg-primary/90">
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player (for video lessons) */}
          {lesson.type === "video" && (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <Play className="w-10 h-10 text-primary ml-1" />
                      </div>
                      <p className="text-white">Video Player Placeholder</p>
                      <p className="text-white/70 text-sm">Duration: {lesson.duration}</p>
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Progress value={35} className="flex-1 h-1" />
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      <span className="text-white text-sm">8:45 / 25:00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lesson Content */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Lesson Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-line text-foreground leading-relaxed">{lesson.content.transcript}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Notes */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Key Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {lesson.content.notes.map((note, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-foreground">{note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Lesson Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{isCompleted ? "100%" : "35%"}</div>
                  <p className="text-sm text-muted-foreground">{isCompleted ? "Completed" : "In Progress"}</p>
                </div>
                <Progress value={isCompleted ? 100 : 35} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
