import { Suspense } from "react"
import RoleManagement from "@/components/admin/role-management"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminRolesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <Suspense
          fallback={
            <Card className="glass-card border-white/10">
              <CardContent className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </CardContent>
            </Card>
          }
        >
          <RoleManagement />
        </Suspense>
      </div>
    </div>
  )
}
