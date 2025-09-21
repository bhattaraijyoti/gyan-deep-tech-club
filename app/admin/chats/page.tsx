import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ChatModeration } from "@/components/admin/chat-moderation";

export default function AdminChatsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-8 p-6">
          <header className="mb-4">
            <h1 className="text-3xl font-bold text-foreground">Chat Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and moderate chat conversations effectively
            </p>
          </header>

          <section className="bg-white rounded-lg shadow p-4">
            <ChatModeration />
          </section>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}