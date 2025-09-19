"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, Trash2, Youtube } from "lucide-react"

interface VideoLesson {
  id: string
  title: string
  youtubeId: string
  duration: string
  description: string
  completed: boolean
}

interface YouTubeVideoPlayerProps {
  courseId: string
  isAdmin?: boolean
}

export default function YouTubeVideoPlayer({ courseId, isAdmin = false }: YouTubeVideoPlayerProps) {
  const [videos, setVideos] = useState<VideoLesson[]>([
    {
      id: "1",
      title: "Introduction to HTML",
      youtubeId: "UB1O30fR-EE",
      duration: "15:30",
      description: "Learn the basics of HTML structure and elements",
      completed: false,
    },
    {
      id: "2",
      title: "CSS Fundamentals",
      youtubeId: "yfoY53QXEnI",
      duration: "22:45",
      description: "Understanding CSS selectors, properties, and styling",
      completed: false,
    },
  ])

  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(videos[0])
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [newVideoTitle, setNewVideoTitle] = useState("")

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const addVideo = () => {
    if (!newVideoUrl || !newVideoTitle) return

    const youtubeId = extractYouTubeId(newVideoUrl)
    if (!youtubeId) {
      alert("Please enter a valid YouTube URL")
      return
    }

    const newVideo: VideoLesson = {
      id: Date.now().toString(),
      title: newVideoTitle,
      youtubeId,
      duration: "0:00",
      description: "New video lesson",
      completed: false,
    }

    setVideos([...videos, newVideo])
    setNewVideoUrl("")
    setNewVideoTitle("")
  }

  const removeVideo = (videoId: string) => {
    setVideos(videos.filter((v) => v.id !== videoId))
    if (selectedVideo?.id === videoId) {
      setSelectedVideo(videos[0] || null)
    }
  }

  const markAsCompleted = (videoId: string) => {
    setVideos(videos.map((v) => (v.id === videoId ? { ...v, completed: !v.completed } : v)))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Player */}
      <div className="lg:col-span-2">
        <Card className="glass-card border-white/10">
          <CardContent className="p-0">
            {selectedVideo ? (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                      <p className="text-gray-400">{selectedVideo.description}</p>
                    </div>
                    <Badge
                      className={
                        selectedVideo.completed ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                      }
                    >
                      {selectedVideo.completed ? "Completed" : "Not Started"}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => markAsCompleted(selectedVideo.id)}
                    className={`${
                      selectedVideo.completed ? "bg-gray-500 hover:bg-gray-600" : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                  >
                    {selectedVideo.completed ? "Mark as Incomplete" : "Mark as Complete"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center bg-gray-800 rounded-lg">
                <div className="text-center text-gray-400">
                  <Youtube className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a video to start learning</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Video List */}
      <div className="space-y-4">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Play className="w-5 h-5" />
              Course Videos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                  selectedVideo?.id === video.id ? "bg-purple-500/20 border border-purple-500/30" : "bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm mb-1">{video.title}</h4>
                    <p className="text-gray-400 text-xs mb-2">{video.duration}</p>
                    <Badge
                      className={video.completed ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
                    >
                      {video.completed ? "Done" : "Todo"}
                    </Badge>
                  </div>
                  {isAdmin && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeVideo(video.id)
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Add Video (Admin Only) */}
        {isAdmin && (
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Plus className="w-4 h-4" />
                Add New Video
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Video Title"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
              <Input
                placeholder="YouTube URL"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
              <Button onClick={addVideo} className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
