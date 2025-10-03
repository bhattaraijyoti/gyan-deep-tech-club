"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, getDocs, deleteDoc } from "firebase/firestore"
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
        return { type: "playlist", id: parsedUrl.searchParams.get("list") }
      }
      if (parsedUrl.searchParams.has("v")) {
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
  const [publishedPlaylists, setPublishedPlaylists] = useState<FirestoreCourse[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null)

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

  const startEditPlaylist = (playlist: FirestoreCourse) => {
    setPlaylistTitle(playlist.title)
    setPlaylistLinks(playlist.videos)
    setPlaylistLanguage(playlist.language)
    setEditingPlaylist(playlist.id || null)
    setShowHistory(false)
  }

  const publishPlaylist = async () => {
    if (!playlistTitle || playlistLinks.length === 0) {
      alert("Please add a title and at least one video link.")
      return
    }

    // Trim and validate all URLs
    const trimmedLinks = playlistLinks.map((l) => l.trim()).filter((l) => !!l)
    for (let link of trimmedLinks) {
      if (!isValidYouTubeUrl(link)) {
        alert(`Invalid YouTube URL detected: ${link}\nPlease check all video links.`)
        return
      }
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
      let userSnap = await getDoc(userRef)

      // Ensure Firestore write matches rules: roleType == "admin" in Firestore
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: adminUid,
          roleType: "admin",
          createdAt: serverTimestamp()
        })
        // Fetch again after setting
        userSnap = await getDoc(userRef)
      }

      const userData = userSnap.data()
      // Log admin data for debugging
      console.log("User data for admin check:", userData)

      // Admin check works for both string and array roleType
      const isAdmin =
        userData?.roleType === "admin" ||
        (Array.isArray(userData?.roleType) && userData.roleType.includes("admin"))

      if (!userSnap.exists() || !isAdmin) {
        alert("You do not have permission to publish courses.")
        return
      }

      setIsPublishing(true)

      const course: FirestoreCourse = {
        title: playlistTitle,
        language: playlistLanguage,
        videos: trimmedLinks,
        createdAt: serverTimestamp(),
        createdBy: adminUid,
      }

      if (editingPlaylist) {
        await setDoc(doc(db, "courses", editingPlaylist), course, { merge: true })
      } else {
        await addDoc(collection(db, "courses"), course)
      }

      setPlaylistTitle("")
      setPlaylistLinks([])
      setCurrentLink("")
      setEditingPlaylist(null)
      alert(editingPlaylist ? "Playlist updated successfully!" : "Playlist published successfully!")
      await fetchPublishedPlaylists()
    } catch (error) {
      console.error("Error publishing playlist: ", error)
      alert("Failed to publish playlist. Try again later.")
    } finally {
      setIsPublishing(false)
    }
  }

  const fetchPublishedPlaylists = async () => {
    try {
      const auth = getAuth()
      const currentUser = auth.currentUser
      if (!currentUser) return

      const q = collection(db, "courses")
      const snapshot = await getDocs(q)
      const playlists: FirestoreCourse[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as FirestoreCourse),
      }))
      setPublishedPlaylists(playlists)
    } catch (error) {
      console.error("Error fetching playlists: ", error)
    }
  }

  useEffect(() => {
    fetchPublishedPlaylists()
  }, [])

  const deletePlaylist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return
    try {
      await deleteDoc(doc(db, "courses", id))
      setPublishedPlaylists((prev) => prev.filter((p) => p.id !== id))
      alert("Playlist deleted successfully.")
    } catch (error) {
      console.error("Error deleting playlist: ", error)
      alert("Failed to delete playlist.")
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
                  onChange={(e) => setPlaylistLanguage(e.target.value as "english" | "hindi")}
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
            {isPublishing ? (editingPlaylist ? "Updating..." : "Publishing...") : (editingPlaylist ? "Update Playlist" : `Publish Playlist (${playlistLanguage.charAt(0).toUpperCase() + playlistLanguage.slice(1)})`)}
          </Button>

          <div>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              className="mb-4 bg-secondary hover:bg-secondary/90 font-semibold text-base py-2 px-4"
            >
              {showHistory ? "Hide History" : "Show History"}
            </Button>
            {showHistory && (
              <>
                <h2 className="text-lg font-semibold mb-2">Published Playlists</h2>
                {publishedPlaylists.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No playlists published yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {publishedPlaylists.map((pl) => (
                      <li key={pl.id} className="flex flex-col bg-muted rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{pl.title} ({pl.language})</span>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditPlaylist(pl)}
                              className="text-primary hover:text-primary"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deletePlaylist(pl.id!)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {pl.videos.map((vid, idx) => {
                            const extracted = extractYouTubeId(vid)
                            return extracted ? (
                              <div key={idx} className="aspect-video w-full rounded overflow-hidden">
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
                            ) : null
                          })}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
