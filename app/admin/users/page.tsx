import { AuthGuard } from "@/components/auth/auth-guard"

import { UserManagement } from "@/components/admin/user-management"

export default function AdminUsersPage() {
  return (
    <AuthGuard requiredRole="admin">

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground">Manage student accounts and roles</p>
            </div>
          </div>

          <UserManagement />
        </div>
      
    </AuthGuard>
  )
}
