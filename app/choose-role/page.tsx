"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/clerk-react"

const roles = [
  { id: "beginner", label: "Beginner", description: "Start your journey with basics.", icon: "🎓" },
  { id: "intermediate", label: "Intermediate", description: "Enhance your skills further.", icon: "🚀" },
  { id: "advanced", label: "Advanced", description: "Master your expertise.", icon: "🏆" },
]

export default function ChooseRolePage() {
  const [role, setRole] = useState("beginner")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user, isLoaded } = useUser()

  // Always call hooks in the same order
  useEffect(() => {
    if (!isLoaded) return

    const checkRole = async () => {
      try {
        const docRef = doc(db, "users", user.id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists() && docSnap.data().role) {
          const target =
            docSnap.data().role === "beginner"
              ? "/dashboard/beginner"
              : docSnap.data().role === "intermediate"
              ? "/dashboard/intermediate"
              : "/dashboard/advanced"
          router.push(target)
        }
      } catch (err) {
        console.error("Error checking existing role:", err)
      }
    }

    checkRole()
  }, [isLoaded, user, router])

  const handleSaveRole = async () => {
    if (!user) return
    setLoading(true)
    try {
      await setDoc(doc(db, "users", user.id), { role }, { merge: true })
      const target =
        role === "beginner"
          ? "/dashboard/beginner"
          : role === "intermediate"
          ? "/dashboard/intermediate"
          : "/dashboard/advanced"
      router.push(target)
    } catch (err) {
      console.error("Error saving role:", err)
      alert("Failed to save role")
    } finally {
      setLoading(false)
    }
  }

  // Conditional rendering inside JSX, not around hooks
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500 text-xl">Loading session...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16 bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      <h1 className="text-5xl font-extrabold mb-12 text-gray-900 text-center drop-shadow-lg">Choose Your Learning Path</h1>
      <div className="flex flex-wrap justify-center gap-10 max-w-6xl w-full">
        {roles.map(({ id, label, description, icon }) => {
          const isSelected = role === id
          const imageUrl =
            id === "beginner"
              ? "https://plus.unsplash.com/premium_photo-1664444320101-d277eac712d2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVjaCUyMGZvciUyMGJlZ2luZWVycyUyMGh0bWx8ZW58MHx8MHx8fDA%3D"
              : id === "intermediate"
              ? "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRlY2h8ZW58MHx8MHx8fDA%3D"
              : "https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHRlY2h8ZW58MHx8MHx8fDA%3D"
          return (
            <div
              key={id}
              onClick={() => setRole(id)}
              className={`flex flex-col cursor-pointer rounded-3xl overflow-hidden shadow-lg transition-transform duration-300 transform ${
                isSelected ? "scale-105 shadow-2xl border-4 border-indigo-500" : "hover:scale-105 hover:shadow-xl"
              } w-72 bg-white`}
            >
              <img src={imageUrl} alt={label} className="w-full h-40 object-cover" />
              <div className="p-6 flex flex-col items-center text-center">
                <div className="relative w-full">
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                  <h2 className={`text-2xl font-semibold mb-2 ${isSelected ? "text-indigo-600" : "text-gray-800"}`}>{label}</h2>
                  <p className="text-gray-600 text-sm">{description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Button
        onClick={handleSaveRole}
        disabled={loading}
        className="mt-12 px-12 py-4 text-lg font-semibold rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
      >
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  )
}