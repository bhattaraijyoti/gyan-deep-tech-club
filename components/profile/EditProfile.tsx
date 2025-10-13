"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelector } from "@/components/ui/multi-selector"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import type { User } from "firebase/auth"

interface UserData {
  about?: string
  skills?: string[]
  interests?: string[]
}

interface EditProfileProps {
  user: User
  userData: UserData | null
  onUpdate: (newData: UserData) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function EditProfile({ user, userData, onUpdate, open, onOpenChange }: EditProfileProps) {
  const [editForm, setEditForm] = useState({
    about: userData?.about || "",
    skills: userData?.skills?.join(", ") || "",
    interests: userData?.interests?.join(", ") || "",
  })
  const [skillOptions, setSkillOptions] = useState<string[]>([
    "Web Development",
    "Mobile Apps",
    "UI/UX Design",
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "Firebase",
    "Machine Learning",
    "C Programming",
    "Database Design",
  ])
  const [interestOptions, setInterestOptions] = useState<string[]>([
    "AI/ML",
    "Cloud Computing",
    "Cybersecurity",
    "Data Science",
    "Web Design",
    "App Development",
    "3D Animation",
    "Game Development",
  ])
  const [saving, setSaving] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  // Detect changes
  useEffect(() => {
    const changed =
      editForm.about !== (userData?.about || "") ||
      editForm.skills !== (userData?.skills?.join(", ") || "") ||
      editForm.interests !== (userData?.interests?.join(", ") || "")
    setHasChanges(changed)
  }, [editForm, userData])

  // Fetch options (with fallback)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const skillsRef = doc(db, "options", "skills")
        const interestsRef = doc(db, "options", "interests")
        const [skillsSnap, interestsSnap] = await Promise.all([
          getDoc(skillsRef),
          getDoc(interestsRef),
        ])

        if (skillsSnap.exists()) {
          const data = skillsSnap.data().list || []
          if (data.length > 0) setSkillOptions(data)
        }

        if (interestsSnap.exists()) {
          const data = interestsSnap.data().list || []
          if (data.length > 0) setInterestOptions(data)
        }
      } catch {
        toast.error("Couldn’t load options. Using defaults.")
      } finally {
        setLoadingOptions(false)
      }
    }
    fetchOptions()
  }, [])

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("No changes to save.")
      return
    }

    setSaving(true)
    try {
      const userRef = doc(db, "users", user.uid)
      const updatedSkills = editForm.skills
        ? editForm.skills.split(",").map(s => s.trim()).filter(Boolean)
        : []
      const updatedInterests = editForm.interests
        ? editForm.interests.split(",").map(i => i.trim()).filter(Boolean)
        : []

      await updateDoc(userRef, {
        about: editForm.about.trim(),
        skills: updatedSkills,
        interests: updatedInterests,
      })

      onUpdate({
        about: editForm.about.trim(),
        skills: updatedSkills,
        interests: updatedInterests,
      })

      toast.success("Profile updated successfully!")
      onOpenChange && onOpenChange(false)
    } catch (err) {
      console.error("Error updating profile:", err)
      toast.error("Failed to save changes.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full p-6 rounded-2xl bg-gray-50 shadow-xl border border-gray-100 space-y-6 animate-in fade-in-50 zoom-in-95">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-xl font-semibold text-gray-800">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* About */}
          <div className="space-y-2">
            <Label htmlFor="about" className="font-medium text-gray-800">About</Label>
            <Textarea
              id="about"
              value={editForm.about}
              onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              className="resize-none rounded-lg border-gray-300 focus:border-blue-400 focus:ring-blue-200"
            />
            <p className="text-xs text-gray-500 text-right">{editForm.about.length}/500</p>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills" className="font-medium text-gray-800">Skills</Label>
            <MultiSelector
              id="skills"
              placeholder={loadingOptions ? "Loading skills..." : "Type or select your skills..."}
              noResultsMessage="No results found."
              options={skillOptions}
              value={editForm.skills.split(",").map(s => s.trim()).filter(Boolean)}
              onChange={(values) => setEditForm({ ...editForm, skills: values.join(", ") })}
              allowCustom
              disabled={loadingOptions}
            />
            <p className="text-xs text-gray-500 mt-1">
              Examples: Web Development ×, Mobile Apps ×, JavaScript ×
            </p>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label htmlFor="interests" className="font-medium text-gray-800">Learning Interests</Label>
            <MultiSelector
              id="interests"
              placeholder={loadingOptions ? "Loading interests..." : "Search or add..."}
              noResultsMessage="No results found."
              options={interestOptions}
              value={editForm.interests.split(",").map(i => i.trim()).filter(Boolean)}
              onChange={(values) => setEditForm({ ...editForm, interests: values.join(", ") })}
              allowCustom
              disabled={loadingOptions}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange && onOpenChange(false)}
            disabled={saving}
            className="rounded-xl border-gray-300 hover:bg-gray-500 transition-colors cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="rounded-xl bg-[#3B9797] hover:bg-[#2e7a7a] text-white px-5 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
