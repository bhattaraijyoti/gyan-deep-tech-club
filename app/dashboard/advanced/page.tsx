import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CourseList } from "@/components/dashboard/course-list"
import { ProgressOverview } from "@/components/dashboard/progress-overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function AdvancedDashboard() {
  return (
    <AuthGuard requiredRole="advanced">
      <DashboardLayout role="advanced">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome, Advanced 💡 – Lead and Inspire!</h1>
              <p className="text-muted-foreground">
                Master cutting-edge technologies and lead the next generation of developers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ProgressOverview role="advanced" />
              <CourseList role="advanced" />
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
