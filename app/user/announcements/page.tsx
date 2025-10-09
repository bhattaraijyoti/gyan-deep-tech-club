"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, getDocs, query, orderBy, Timestamp, updateDoc, doc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { onAuthStateChanged } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search, Pin, Bell, Calendar, Paperclip, X, Plus, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Announcement {
  id: string
  title: string
  message: string
  summary?: string
  description?: string
  image?: string
  category: "Event" | "Notice" | "Update" | "General"
  isImportant: boolean
  isPinned: boolean
  createdAt: Timestamp
  createdBy?: string
  attachments?: string[]
  readBy?: string[]
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState<"Event" | "Notice" | "Update" | "General">("Notice")
  const [isImportant, setIsImportant] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        const adminEmails = ["admin@example.com", "principal@example.com"]
        setIsAdmin(adminEmails.includes(currentUser.email || ""))
      } else {
        router.replace("/unauthorized")
      }
    })
    return () => unsubscribe()
  }, [router])

  const fetchAnnouncements = async () => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Announcement[]
    setAnnouncements(data)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    let filtered = [...announcements]
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.summary && a.summary.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((a) => a.category === categoryFilter)
    }
    if (showUnreadOnly && user) {
      filtered = filtered.filter((a) => !a.readBy?.includes(user.uid))
    }
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.createdAt.toMillis() - a.createdAt.toMillis()
    })
    setFilteredAnnouncements(filtered)
  }, [announcements, searchQuery, categoryFilter, showUnreadOnly, user])

  const handlePost = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all required fields")
      return
    }
    if (uploading) {
      toast.error("Please wait for the attachments to finish uploading")
      return
    }
    setLoading(true)
    try {
      const uploadedUrls: string[] = []
      if (attachmentFiles.length > 0) {
        setUploading(true)
        const storage = getStorage()
        for (const file of attachmentFiles) {
          const ext = file.name.split(".").pop()
          const storageRef = ref(storage, `announcements/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`)
          await uploadBytes(storageRef, file)
          const url = await getDownloadURL(storageRef)
          uploadedUrls.push(url)
        }
        setUploading(false)
      }
      const newAnnouncement: any = {
        title,
        message,
        summary: summary || message.substring(0, 120) + "...",
        category,
        isImportant,
        isPinned,
        createdAt: Timestamp.now(),
        createdBy: user?.email,
        readBy: [],
        attachments: uploadedUrls.length > 0 ? uploadedUrls : [],
      }
      await addDoc(collection(db, "announcements"), newAnnouncement)
      toast.success("Announcement posted successfully!")
      setTitle("")
      setMessage("")
      setSummary("")
      setCategory("Notice")
      setIsImportant(false)
      setIsPinned(false)
      setAttachments([])
      setAttachmentFiles([])
      setShowCreateForm(false)
      fetchAnnouncements()
    } catch (error) {
      console.error(error)
      toast.error("Failed to post announcement")
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setAttachmentFiles((prev) => [...prev, ...files])
  }

  const handleRemoveAttachment = (idx: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const markAsRead = async (announcementId: string) => {
    if (!user) return
    const announcement = announcements.find((a) => a.id === announcementId)
    if (!announcement || announcement.readBy?.includes(user.uid)) return
    try {
      const readBy = announcement.readBy || []
      await updateDoc(doc(db, "announcements", announcementId), {
        readBy: [...readBy, user.uid],
      })
      fetchAnnouncements()
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const isUnread = (announcement: Announcement) => {
    return user && !announcement.readBy?.includes(user.uid)
  }

  const isNew = (announcement: Announcement) => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
    return announcement.createdAt.toMillis() > threeDaysAgo
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Event":
        return "bg-accent-blue/10 text-accent-blue border-accent-blue/20"
      case "Notice":
        return "bg-accent-amber/10 text-accent-amber border-accent-amber/20"
      case "Update":
        return "bg-accent-green/10 text-accent-green border-accent-green/20"
      case "General":
        return "bg-muted/60 text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-16 py-12 lg:py-16">
          <div className="flex items-start justify-between gap-12">
            <div className="flex-1 space-y-4">
              <h1 className="font-serif text-5xl lg:text-7xl font-light tracking-tight text-foreground leading-[1.1]">
                Announcements
              </h1>
              <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl">
                Stay informed with the latest updates and important notices
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                size="lg"
                className="mt-2 gap-2.5 font-medium px-6 h-12 rounded-xl"
                variant={showCreateForm ? "outline" : "default"}
              >
                {showCreateForm ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 lg:px-16 py-16 lg:py-20">
        {isAdmin && showCreateForm && (
          <Card className="p-10 lg:p-12 mb-16 border-border/50 shadow-sm bg-card rounded-2xl">
            <h2 className="font-serif text-4xl font-light mb-10 text-foreground">Create Announcement</h2>
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground/90 tracking-wide uppercase text-xs">
                    Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading || uploading}
                    className="text-base h-12 rounded-xl border-border/50"
                    placeholder="Enter announcement title"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground/90 tracking-wide uppercase text-xs">
                    Category
                  </label>
                  <Select
                    value={category}
                    onValueChange={(val: any) => setCategory(val)}
                    disabled={loading || uploading}
                  >
                    <SelectTrigger className="text-base h-12 rounded-xl border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="Notice">Notice</SelectItem>
                      <SelectItem value="Update">Update</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground/90 tracking-wide uppercase text-xs">
                  Summary
                </label>
                <Input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  disabled={loading || uploading}
                  className="text-base h-12 rounded-xl border-border/50"
                  placeholder="Brief summary (optional)"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground/90 tracking-wide uppercase text-xs">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={10}
                  disabled={loading || uploading}
                  className="text-base resize-none rounded-xl border-border/50 leading-relaxed"
                  placeholder="Enter the full announcement message"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground/90 tracking-wide uppercase text-xs">
                  Attachments
                </label>
                <Input
                  type="file"
                  multiple
                  onChange={handleAttachmentChange}
                  disabled={loading || uploading}
                  className="text-base cursor-pointer h-12 rounded-xl border-border/50"
                />
                {attachmentFiles.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-4">
                    {attachmentFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-muted/30 rounded-xl px-5 py-3 border border-border/50 text-sm group hover:bg-muted/50 transition-all"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={file.name}
                            className="h-12 w-12 object-cover rounded-lg border border-border/50"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center border border-border/50">
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="truncate max-w-[200px] text-foreground font-medium">{file.name}</span>
                        <button
                          onClick={() => handleRemoveAttachment(idx)}
                          className="ml-2 p-1.5 hover:bg-background rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-8 pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="w-5 h-5 rounded-md border-border/50 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-foreground group-hover:text-foreground/70 transition-colors">
                    Mark as Important
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-5 h-5 rounded-md border-border/50 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-foreground group-hover:text-foreground/70 transition-colors">
                    Pin to Top
                  </span>
                </label>
              </div>

              <div className="flex gap-4 pt-8 border-t border-border/50">
                <Button
                  onClick={handlePost}
                  disabled={loading || uploading}
                  className="flex-1 h-12 text-base font-medium rounded-xl"
                >
                  {loading ? "Publishing..." : uploading ? "Uploading..." : "Publish Announcement"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading || uploading}
                  className="h-12 px-10 text-base font-medium rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-12 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-5" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 pl-14 h-14 text-base border-border/50 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-4">
              <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val)}>
                <SelectTrigger className="w-[220px] h-14 text-base border-border/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Notice">Notice</SelectItem>
                  <SelectItem value="Update">Update</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>

              <label className="flex items-center gap-3 cursor-pointer group whitespace-nowrap px-4">
                <input
                  type="checkbox"
                  id="unreadOnly"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="w-5 h-5 rounded-md border-border/50 cursor-pointer"
                />
                <span className="text-sm font-medium text-foreground group-hover:text-foreground/70 transition-colors">
                  Unread Only
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((announcement) => {
            return (
              <Card
                key={announcement.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/40 overflow-hidden bg-card hover:border-border/60"
                onClick={() => {
                  setSelectedAnnouncement(announcement)
                  markAsRead(announcement.id)
                }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-serif font-medium text-foreground leading-snug text-balance group-hover:text-foreground/80 transition-colors">
                    {announcement.title}
                  </h3>
                </div>
              </Card>
            )
          })}

          {filteredAnnouncements.length === 0 && (
            <div className="col-span-full text-center py-24">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/30 mb-6">
                <Bell className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <p className="font-serif text-2xl text-foreground font-light mb-2">No announcements found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>

        <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader className="space-y-6 pb-8 border-b border-border/50">
              <div className="space-y-4">
                <DialogTitle className="font-serif text-4xl font-light leading-tight text-balance pr-8 text-foreground">
                  {selectedAnnouncement?.title}
                </DialogTitle>

                <div className="flex flex-wrap gap-3 items-center">
                  <Badge
                    variant="outline"
                    className={`${getCategoryColor(selectedAnnouncement?.category || "General")} text-xs font-medium px-3 py-1.5 rounded-lg`}
                  >
                    {selectedAnnouncement?.category}
                  </Badge>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedAnnouncement?.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>

                  {selectedAnnouncement?.isImportant && (
                    <Badge variant="destructive" className="text-xs px-3 py-1.5 rounded-md">
                      Important
                    </Badge>
                  )}

                  {selectedAnnouncement?.isPinned && (
                    <Badge variant="secondary" className="text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="mt-8 space-y-8">
              {selectedAnnouncement?.image && (
                <div className="flex justify-center rounded-xl overflow-hidden border border-border/50">
                  <img
                    src={selectedAnnouncement.image || "/placeholder.svg"}
                    alt="Announcement"
                    className="max-h-[500px] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {selectedAnnouncement?.attachments && selectedAnnouncement.attachments.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {selectedAnnouncement.attachments.map((url, idx) => {
                    const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)
                    if (isImage) {
                      return (
                        <div key={idx} className="rounded-xl overflow-hidden border border-border/50">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Attachment ${idx + 1}`}
                            className="max-h-72 object-contain"
                            loading="lazy"
                          />
                        </div>
                      )
                    } else {
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors text-sm font-medium text-foreground"
                        >
                          <Paperclip className="w-4 h-4" />
                          Attachment {idx + 1}
                        </a>
                      )
                    }
                  })}
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                  {selectedAnnouncement?.description || selectedAnnouncement?.summary || selectedAnnouncement?.message}
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-border/50 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-10 h-12 text-base font-medium rounded-xl"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
