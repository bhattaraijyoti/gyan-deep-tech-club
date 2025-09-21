"use client";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CourseList } from "@/components/dashboard/course-list"
import { ProgressOverview } from "@/components/dashboard/progress-overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function BeginnerDashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) setUser(u)
      else router.push("/join")
    })
    return () => unsubscribe()
  }, [router])

  if (!user) {
    return null // or a loading spinner
  }

  return (
    <>
      {/* Normal dashboard layout for medium+ screens */}
      <div className="hidden md:block">
        <DashboardLayout role="beginner">
          <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center sm:text-left">
                  Welcome, Beginner 🌱 – Start Your Tech Journey!
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-center sm:text-left">
                  Begin your adventure in technology with our carefully crafted beginner courses
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="md:col-span-2 space-y-4 sm:space-y-6">
                <ProgressOverview role="beginner" />
                <CourseList role="beginner" />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <RecentActivity />
              </div>
            </div>
          </div>
        </DashboardLayout>
      </div>

      {/* Floating circle button dashboard for small devices */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <input type="checkbox" id="dashboard-toggle" className="hidden peer" />
        <label
          htmlFor="dashboard-toggle"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-lg cursor-pointer peer-checked:rotate-45 transition-transform duration-300"
        >
          ☰
        </label>
        <div className="absolute bottom-16 right-0 w-80 max-w-[90vw] max-h-[70vh] overflow-y-auto rounded-2xl bg-white shadow-xl p-4 scale-0 peer-checked:scale-100 origin-bottom-right transition-transform duration-300">
          <h2 className="text-lg font-semibold mb-4 text-center">Dashboard</h2>
          <div className="space-y-4">
            <ProgressOverview role="beginner" />
            <CourseList role="beginner" />
            <RecentActivity />
          </div>
        </div>
      </div>
    </>
  )
}
