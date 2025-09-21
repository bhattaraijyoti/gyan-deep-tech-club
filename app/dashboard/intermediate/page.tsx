import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CourseList } from "@/components/dashboard/course-list"
import { ProgressOverview } from "@/components/dashboard/progress-overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function IntermediateDashboard() {
  return (
    <AuthGuard requiredRole="intermediate">
      <DashboardLayout role="intermediate">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center sm:text-left">
                Welcome, Intermediate 🚀 – Time to Level Up!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
                Take your skills to the next level with advanced programming concepts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-3 sm:px-6 md:px-0">
            <div className="md:col-span-2 space-y-6">
              <ProgressOverview role="intermediate" />
              <CourseList role="intermediate" />
            </div>
            <div className="space-y-6">
              <RecentActivity />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
