"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Loader2,
  Trash2,
  Edit,
  Pin,
  PinOff,
  AlertCircle,
  Plus,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Announcement {
  id: string
  title: string
  description: string
  image?: string
  category: string
  isPinned: boolean
  isImportant: boolean
  createdAt: any
  updatedAt?: any
}

const CATEGORIES = [
  "General",
  "Updates",
  "Maintenance",
  "Features",
  "Events",
  "Security",
]

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("General")
  const [isPinned, setIsPinned] = useState(false)
  const [isImportant, setIsImportant] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)

  // Fetch announcements
  const fetchAnnouncements = async () => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Announcement[]

    const sorted = data.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })

    setAnnouncements(sorted)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCategory("General")
    setIsPinned(false)
    setIsImportant(false)
    setImageUrl("")
    setEditingId(null)
  }

  // Handle image upload to Firebase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const storage = getStorage()
      const storageRef = ref(storage, `announcements/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      setImageUrl(downloadURL)
      toast({ title: "Image uploaded successfully" })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to upload image.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    const safeTitle = title || ""
    const safeDescription = description || ""

    if (!safeTitle.trim() || !safeDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const announcementData = {
      title: safeTitle,
      description: safeDescription,
      category: category || "General",
      isPinned: !!isPinned,
      isImportant: !!isImportant,
      image: imageUrl || null,
      updatedAt: Timestamp.now(),
    }

    setLoading(true)
    try {
      if (editingId) {
        console.log("Updating:", editingId, announcementData)
        await updateDoc(doc(db, "announcements", editingId), announcementData)
        toast({ title: "Success", description: "Announcement updated successfully." })
      } else {
        await addDoc(collection(db, "announcements"), {
          ...announcementData,
          createdAt: Timestamp.now(),
        })
        toast({ title: "Success", description: "Announcement created successfully." })
      }

      resetForm()
      setIsDialogOpen(false)
      await fetchAnnouncements()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to save announcement.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id)
    setTitle(announcement.title || "")
    setDescription(announcement.description || "")
    setCategory(announcement.category || "General")
    setIsPinned(!!announcement.isPinned)
    setIsImportant(!!announcement.isImportant)
    setImageUrl(announcement.image || "")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return

    try {
      await deleteDoc(doc(db, "announcements", id))
      toast({
        title: "Success",
        description: "Announcement deleted successfully.",
      })
      await fetchAnnouncements()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to delete announcement.",
        variant: "destructive",
      })
    }
  }

  const togglePin = async (announcement: Announcement) => {
    try {
      await updateDoc(doc(db, "announcements", announcement.id), {
        isPinned: !announcement.isPinned,
        updatedAt: Timestamp.now(),
      })
      await fetchAnnouncements()
      toast({
        title: "Success",
        description: announcement.isPinned
          ? "Announcement unpinned."
          : "Announcement pinned to top.",
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to update pin status.",
        variant: "destructive",
      })
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      General: "bg-muted text-muted-foreground",
      Updates: "bg-blue-500/10 text-blue-500",
      Maintenance: "bg-orange-500/10 text-orange-500",
      Features: "bg-green-500/10 text-green-500",
      Events: "bg-purple-500/10 text-purple-500",
      Security: "bg-red-500/10 text-red-500",
    }
    return colors[category] || colors.General
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Announcements Admin</h1>
              <p className="text-muted-foreground mt-1">
                Create, edit, and manage announcements
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm()
                    setIsDialogOpen(true)
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit Announcement" : "Create New Announcement"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details below to{" "}
                    {editingId ? "update" : "create"} an announcement.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter announcement title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Write your announcement description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL (Optional)</Label>
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <Input type="file" accept="image/*" onChange={handleImageUpload} />
                    </div>
                    {imageUrl && (
                      <div className="relative mt-2 rounded-lg overflow-hidden border border-border">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pinned">Pin to Top</Label>
                        <p className="text-xs text-muted-foreground">
                          Pinned announcements appear first
                        </p>
                      </div>
                      <Switch
                        id="pinned"
                        checked={isPinned}
                        onCheckedChange={setIsPinned}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="important">Mark as Important</Label>
                        <p className="text-xs text-muted-foreground">
                          Highlights the announcement with a badge
                        </p>
                      </div>
                      <Switch
                        id="important"
                        checked={isImportant}
                        onCheckedChange={setIsImportant}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSubmit} disabled={loading || uploading} className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : editingId ? (
                        "Update Announcement"
                      ) : (
                        "Create Announcement"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetForm()
                        setIsDialogOpen(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* List of Announcements */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No announcements yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Create your first announcement to get started
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className="p-6 hover:border-muted-foreground/20 transition-colors"
              >
                <div className="flex gap-6">
                  {announcement.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={announcement.image || "/placeholder.svg"}
                        alt={announcement.title}
                        className="w-32 h-32 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {announcement.isPinned && (
                            <Badge className="gap-1 bg-blue-500/10 text-blue-500">
                              <Pin className="w-3 h-3" /> Pinned
                            </Badge>
                          )}
                          {announcement.isImportant && (
                            <Badge className="gap-1 bg-orange-500/10 text-orange-500">
                              <AlertCircle className="w-3 h-3" /> Important
                            </Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className={getCategoryColor(announcement.category)}
                          >
                            {announcement.category}
                          </Badge>
                        </div>

                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {announcement.description}
                        </p>

                        <p className="text-xs text-muted-foreground mt-4">
                          Created{" "}
                          {announcement.createdAt?.toDate().toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {announcement.updatedAt && " • Updated"}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePin(announcement)}
                          title={announcement.isPinned ? "Unpin" : "Pin to top"}
                        >
                          {announcement.isPinned ? (
                            <PinOff className="w-4 h-4" />
                          ) : (
                            <Pin className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(announcement)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(announcement.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}