import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ChatModeration } from "@/components/admin/chat-moderation"

export default function AdminChatsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Chat Management</h1>
              <p className="text-muted-foreground">Monitor and moderate chat conversations</p>
            </div>
          </div>

          <ChatModeration />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
