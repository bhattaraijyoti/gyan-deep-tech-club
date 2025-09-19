import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AdminOverview } from "@/components/admin/admin-overview"
import { QuickActions } from "@/components/admin/quick-actions"
import { RecentActivity } from "@/components/admin/recent-activity"

export default function AdminDashboard() {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your tech club platform</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AdminOverview />
              <QuickActions />
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
