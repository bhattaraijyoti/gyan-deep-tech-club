import { AuthGuard } from "@/components/auth/auth-guard"

import { CourseManagement } from "@/components/admin/course-management"

export default function AdminCoursesPage() {
  return (
    <AuthGuard requiredRole="admin">

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
              <p className="text-muted-foreground">Create and manage courses and lessons</p>
            </div>
          </div>

          <CourseManagement />
        </div>

    </AuthGuard>
  )
}
