import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function RoleChatPage() {
  // In real app, get user role from auth context
  const userRole = "beginner" // Mock role

  return (
    <AuthGuard>
      <DashboardLayout role={userRole}>
        <div className="h-[calc(100vh-8rem)]">
          <ChatInterface chatType="role" title={`${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Chat`} />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
