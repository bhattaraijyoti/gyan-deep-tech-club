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
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900"
      case "Notice":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
      case "Update":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
      case "General":
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800"
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Event":
        return "📅"
      case "Notice":
        return "⚠️"
      case "Update":
        return "🔄"
      case "General":
        return "📢"
      default:
        return "📢"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 space-y-1.5">
              <h1 className="font-sans text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Announcements</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stay informed with the latest updates and important notices
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                size="lg"
                className="gap-2 font-medium shadow-sm"
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
                    New Announcement
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {isAdmin && showCreateForm && (
          <Card className="p-6 lg:p-8 mb-8 shadow-md border-2">
            <h2 className="font-sans text-2xl font-semibold mb-6 text-foreground">Create New Announcement</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading || uploading}
                    className="text-base"
                    placeholder="Enter announcement title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <Select
                    value={category}
                    onValueChange={(val: any) => setCategory(val)}
                    disabled={loading || uploading}
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Event">📅 Event</SelectItem>
                      <SelectItem value="Notice">⚠️ Notice</SelectItem>
                      <SelectItem value="Update">🔄 Update</SelectItem>
                      <SelectItem value="General">📢 General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Summary</label>
                <Input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  disabled={loading || uploading}
                  className="text-base"
                  placeholder="Brief summary (optional - will be auto-generated if left empty)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Message <span className="text-destructive">*</span>
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  disabled={loading || uploading}
                  className="text-base resize-none leading-relaxed"
                  placeholder="Enter the full announcement message"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Attachments</label>
                <Input
                  type="file"
                  multiple
                  onChange={handleAttachmentChange}
                  disabled={loading || uploading}
                  className="text-base cursor-pointer"
                />
                {attachmentFiles.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {attachmentFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-2.5 border text-sm group hover:bg-muted transition-colors"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={file.name}
                            className="h-10 w-10 object-cover rounded border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center border">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="truncate max-w-[180px] text-foreground font-medium">{file.name}</span>
                        <button
                          onClick={() => handleRemoveAttachment(idx)}
                          className="ml-1 p-1 hover:bg-background rounded transition-colors"
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="w-4 h-4 rounded border-input cursor-pointer"
                  />
                  <span className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                    Mark as Important
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded border-input cursor-pointer"
                  />
                  <span className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                    Pin to Top
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handlePost}
                  disabled={loading || uploading}
                  className="flex-1 text-base font-medium shadow-sm"
                >
                  {loading ? "Publishing..." : uploading ? "Uploading..." : "Publish Announcement"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading || uploading}
                  className="px-8 text-base font-medium"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-4 pointer-events-none" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 pl-12 h-11 text-base shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val)}>
                <SelectTrigger className="w-[200px] h-11 text-base shadow-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Event">📅 Event</SelectItem>
                  <SelectItem value="Notice">⚠️ Notice</SelectItem>
                  <SelectItem value="Update">🔄 Update</SelectItem>
                  <SelectItem value="General">📢 General</SelectItem>
                </SelectContent>
              </Select>

              <label className="flex items-center gap-2.5 cursor-pointer group whitespace-nowrap px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  id="unreadOnly"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-input cursor-pointer"
                />
                <span className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
                  Unread Only
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnnouncements.map((announcement) => {
            const unread = isUnread(announcement)
            const isNewAnnouncement = isNew(announcement)

            return (
              <Card
                key={announcement.id}
                className={`group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden bg-card hover:border-primary/50 ${
                  unread ? "border-primary/30 shadow-md" : "border-border/40"
                }`}
                onClick={() => {
                  setSelectedAnnouncement(announcement)
                  markAsRead(announcement.id)
                }}
              >
                <div className="p-5 space-y-4">
                  {/* Header with badges */}
                  <div className="flex items-start justify-between gap-3">
                    <Badge
                      variant="outline"
                      className={`${getCategoryColor(announcement.category)} text-xs font-medium px-2.5 py-1 shrink-0`}
                    >
                      {getCategoryIcon(announcement.category)} {announcement.category}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      {announcement.isPinned && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                        </Badge>
                      )}
                      {isNewAnnouncement && (
                        <Badge className="text-xs px-2 py-0.5 bg-primary text-primary-foreground">New</Badge>
                      )}
                      {unread && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-foreground leading-snug text-balance group-hover:text-primary transition-colors line-clamp-2">
                    {announcement.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {announcement.summary || announcement.message}
                  </p>

                  {/* Footer with metadata */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{announcement.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {announcement.attachments && announcement.attachments.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{announcement.attachments.length}</span>
                        </div>
                      )}
                      {announcement.isImportant && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5">
                          Important
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}

          {filteredAnnouncements.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <Bell className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="font-sans text-xl text-foreground font-semibold mb-2">No announcements found</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {searchQuery || categoryFilter !== "all" || showUnreadOnly
                  ? "Try adjusting your filters or search query to see more results"
                  : "There are no announcements to display at this time"}
              </p>
            </div>
          )}
        </div>

        <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="space-y-4 pb-6 border-b">
              <div className="space-y-3">
                <DialogTitle className="font-sans text-3xl font-bold leading-tight text-balance pr-8 text-foreground">
                  {selectedAnnouncement?.title}
                </DialogTitle>

                <div className="flex flex-wrap gap-2 items-center">
                  <Badge
                    variant="outline"
                    className={`${getCategoryColor(selectedAnnouncement?.category || "General")} text-xs font-medium px-3 py-1`}
                  >
                    {getCategoryIcon(selectedAnnouncement?.category || "General")} {selectedAnnouncement?.category}
                  </Badge>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedAnnouncement?.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>

                  {selectedAnnouncement?.isImportant && (
                    <Badge variant="destructive" className="text-xs px-3 py-1">
                      Important
                    </Badge>
                  )}

                  {selectedAnnouncement?.isPinned && (
                    <Badge variant="secondary" className="text-xs px-3 py-1 flex items-center gap-1.5">
                      <Pin className="w-3 h-3" />
                      Pinned
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {selectedAnnouncement?.image && (
                <div className="flex justify-center rounded-lg overflow-hidden border">
                  <img
                    src={selectedAnnouncement.image || "/placeholder.svg"}
                    alt="Announcement"
                    className="max-h-[400px] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {selectedAnnouncement?.attachments && selectedAnnouncement.attachments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Attachments</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedAnnouncement.attachments.map((url, idx) => {
                      const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)
                      if (isImage) {
                        return (
                          <div key={idx} className="rounded-lg overflow-hidden border">
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`Attachment ${idx + 1}`}
                              className="max-h-60 object-contain"
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
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border hover:bg-muted/50 transition-colors text-sm font-medium text-foreground"
                          >
                            <Paperclip className="w-4 h-4" />
                            Attachment {idx + 1}
                          </a>
                        )
                      }
                    })}
                  </div>
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                  {selectedAnnouncement?.description || selectedAnnouncement?.summary || selectedAnnouncement?.message}
                </p>
              </div>

              {selectedAnnouncement?.createdBy && (
                <div className="pt-4 border-t text-sm text-muted-foreground">
                  Posted by <span className="font-medium text-foreground">{selectedAnnouncement.createdBy}</span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedAnnouncement(null)} className="px-8 font-medium">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
