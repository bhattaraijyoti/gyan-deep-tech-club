import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function PrivateChatPage() {
  return (
    <AuthGuard>
      <DashboardLayout role="beginner">
        <div className="h-[calc(100vh-8rem)]">
          <ChatInterface chatType="private" title="Private Messages" />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
