import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function GeneralChatPage() {
  return (
    <AuthGuard>
      <DashboardLayout role="beginner">
        <div className="h-[calc(100vh-8rem)]">
          <ChatInterface chatType="general" title="General Chat" />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
