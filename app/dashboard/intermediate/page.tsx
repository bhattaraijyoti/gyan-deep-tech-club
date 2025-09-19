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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome, Intermediate 🚀 – Time to Level Up!</h1>
              <p className="text-muted-foreground">
                Take your skills to the next level with advanced programming concepts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
