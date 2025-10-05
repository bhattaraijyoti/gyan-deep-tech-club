import UserManagement from "@/components/admin/user-management"
import { AuthGuard } from "@/components/auth/auth-guard"


export default function AdminUsersPage() {
  return (
    <AuthGuard requiredRole="admin">

        <div className="space-y-6">
       

          <UserManagement />
        </div>
      
    </AuthGuard>
  )
}
