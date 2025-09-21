"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db, auth } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"

const roles = [
  {
    id: "beginner",
    label: "Beginner",
    description: "Start your journey with basics.",
    imageUrl: "https://source.unsplash.com/400x300/?learning,student",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Enhance your skills further.",
    imageUrl: "https://source.unsplash.com/400x300/?study,books",
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "Master your expertise.",
    imageUrl: "https://source.unsplash.com/400x300/?graduation,success",
  },
]

export default function ChooseRolePage() {
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid)
      else router.push("/join") // redirect if not signed in
    })

    return () => unsubscribe()
  }, [router])

  const handleSaveRole = async () => {
    if (!userId || !role) {
      alert("Please select a role first!")
      return
    }
    setLoading(true)
    try {
      await setDoc(doc(db, "users", userId), { role: [role] }, { merge: true }) // store role as array
      router.push(`/dashboard/${role}`)
    } catch (error) {
      console.error("Failed to save role:", error)
      alert("An error occurred while saving your role. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16 bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      <h1 className="text-5xl font-extrabold mb-14 text-gray-900 text-center tracking-tight drop-shadow-md">
        Choose Your Learning Path
      </h1>
      <section className="flex flex-wrap justify-center gap-8 max-w-6xl w-full">
        {roles.map(({ id, label, description, imageUrl }) => {
          const isSelected = role === id
          return (
            <article
              key={id}
              onClick={() => setRole(id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setRole(id)
                }
              }}
              className={`relative flex flex-col cursor-pointer rounded-3xl overflow-hidden shadow-md transition-transform duration-300 ease-in-out bg-white w-72 select-none focus:outline-none focus:ring-4 focus:ring-indigo-400 ${
                isSelected ? "scale-105 shadow-2xl border-4 border-indigo-500" : "hover:scale-[1.03] hover:shadow-lg"
              }`}
            >
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={label}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                />
                {isSelected && (
                  <span
                    aria-label="Selected"
                    className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg text-lg font-bold select-none"
                  >
                    ✓
                  </span>
                )}
              </div>
              <div className="p-6 flex flex-col items-center text-center space-y-3">
                <h2 className={`text-2xl font-semibold mb-1 ${isSelected ? "text-indigo-600" : "text-gray-900"} transition-colors duration-300`}>
                  {label}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            </article>
          )
        })}
      </section>
      <Button
        onClick={handleSaveRole}
        disabled={loading || !role || !userId}
        className="mt-14 px-14 py-4 text-lg font-semibold rounded-full bg-indigo-600 text-white shadow-lg transition duration-300 ease-in-out hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Continue"}
      </Button>
    </main>
  )
}