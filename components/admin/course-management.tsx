"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"

interface FirestoreCourse {
  id?: string
  title: string
  language: "english" | "hindi"
  videos: string[]
  createdAt: any
  createdBy?: string
}

function isValidYouTubeUrl(url: string) {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.replace("www.", "")

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      // Check for either video or playlist
      return parsedUrl.searchParams.has("v") || parsedUrl.searchParams.has("list")
    } else if (hostname === "youtu.be") {
      return parsedUrl.pathname.length > 1
    }
    return false
  } catch {
    return false
  }
}

function extractYouTubeId(url: string) {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.replace("www.", "")

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (parsedUrl.searchParams.has("list")) {
        // Playlist
        return { type: "playlist", id: parsedUrl.searchParams.get("list") }
      }
      if (parsedUrl.searchParams.has("v")) {
        // Single video
        return { type: "video", id: parsedUrl.searchParams.get("v") }
      }
    } else if (hostname === "youtu.be") {
      return { type: "video", id: parsedUrl.pathname.slice(1) }
    }
    return null
  } catch {
    return null
  }
}

export function CourseManagement() {
  const [playlistTitle, setPlaylistTitle] = useState("")
  const [playlistLinks, setPlaylistLinks] = useState<string[]>([])
  const [currentLink, setCurrentLink] = useState("")
  const [playlistLanguage, setPlaylistLanguage] = useState<"english" | "hindi">("english")
  const [isPublishing, setIsPublishing] = useState(false)

  const addPlaylistLink = () => {
    const trimmedLink = currentLink.trim()
    if (!trimmedLink) return

    if (!isValidYouTubeUrl(trimmedLink)) {
      alert("Please enter a valid YouTube video link.")
      return
    }

    if (playlistLinks.includes(trimmedLink)) {
      alert("This link is already added.")
      return
    }
    setPlaylistLinks((prev) => [...prev, trimmedLink])
    setCurrentLink("")
  }

  const removePlaylistLink = (index: number) => {
    setPlaylistLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const publishPlaylist = async () => {
    if (!playlistTitle || playlistLinks.length === 0) {
      alert("Please add a title and at least one video link.")
      return
    }

    const auth = getAuth()
    const currentUser = auth.currentUser
    if (!currentUser) {
      alert("You must be signed in to publish a playlist.")
      return
    }

    const adminUid = currentUser.uid

    try {
      const userRef = doc(db, "users", adminUid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        // Create admin user document if it doesn't exist
        await setDoc(userRef, {
          uid: adminUid,
          roleType: "admin",
          createdAt: serverTimestamp()
        })
      }

      // Re-fetch user document after creation or if existed
      const updatedUserSnap = await getDoc(userRef)
      const userData = updatedUserSnap.data()
      if (!updatedUserSnap.exists() || !userData?.roleType?.includes("admin")) {
        alert("You do not have permission to publish courses.")
        return
      }

      setIsPublishing(true)

      const course: FirestoreCourse = {
        title: playlistTitle,
        language: playlistLanguage,
        videos: playlistLinks,
        createdAt: serverTimestamp(),
        createdBy: adminUid,
      }

      await addDoc(collection(db, "courses"), course)

      setPlaylistTitle("")
      setPlaylistLinks([])
      setCurrentLink("")
      alert("Playlist published successfully!")
    } catch (error) {
      console.error("Error publishing playlist: ", error)
      alert("Failed to publish playlist. Try again later.")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>YouTube Playlist Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Playlist Details */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Playlist Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="playlist-title">
                  Playlist Title
                </label>
                <Input
                  id="playlist-title"
                  placeholder="Playlist title"
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="playlist-language">
                  Language
                </label>
                <select
                  id="playlist-language"
                  value={playlistLanguage}
                  onChange={(e) =>
                    setPlaylistLanguage(e.target.value as "english" | "hindi")
                  }
                  className="w-full rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Videos */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Add Videos</h2>
            <label className="block text-sm font-medium mb-1" htmlFor="youtube-link">
              Add YouTube Video
            </label>
            <div className="flex space-x-2">
              <Input
                id="youtube-link"
                placeholder="YouTube video link"
                value={currentLink}
                onChange={(e) => setCurrentLink(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPlaylistLink()}
              />
              <Button
                onClick={addPlaylistLink}
                className="bg-primary hover:bg-primary/90"
              >
                Add Video
              </Button>
            </div>
          </div>

          {/* Playlist Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Playlist Preview</h2>
            {playlistLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No videos added yet.</p>
            ) : (
              <ul className="max-h-80 overflow-auto space-y-4">
                {playlistLinks.map((link, index) => {
                  const extracted = extractYouTubeId(link)
                  return (
                    <li
                      key={index}
                      className="flex flex-col bg-muted rounded p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="truncate max-w-[80%]">{link}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removePlaylistLink(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {extracted && (
                        <div className="aspect-video w-full rounded overflow-hidden">
                          {extracted.type === "video" ? (
                            <iframe
                              width="100%"
                              height="180"
                              src={`https://www.youtube.com/embed/${extracted.id}`}
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <iframe
                              width="100%"
                              height="180"
                              src={`https://www.youtube.com/embed/videoseries?list=${extracted.id}`}
                              title="YouTube playlist player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <Button
            onClick={publishPlaylist}
            disabled={isPublishing}
            className="bg-primary hover:bg-primary/90 w-full mt-4 font-semibold text-base py-3"
          >
            {isPublishing ? "Publishing..." : `Publish Playlist (${playlistLanguage.charAt(0).toUpperCase() + playlistLanguage.slice(1)})`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
