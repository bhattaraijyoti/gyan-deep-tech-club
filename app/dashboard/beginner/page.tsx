import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CourseList } from "@/components/dashboard/course-list"
import { ProgressOverview } from "@/components/dashboard/progress-overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function BeginnerDashboard() {
  return (
    <AuthGuard requiredRole="beginner">
      <DashboardLayout role="beginner">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome, Beginner 🌱 – Start Your Tech Journey!</h1>
              <p className="text-muted-foreground">
                Begin your adventure in technology with our carefully crafted beginner courses
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ProgressOverview role="beginner" />
              <CourseList role="beginner" />
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
