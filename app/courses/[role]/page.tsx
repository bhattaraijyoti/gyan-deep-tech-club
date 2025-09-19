import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CourseGrid } from "@/components/courses/course-grid"
import { CourseFilters } from "@/components/courses/course-filters"

interface CoursePageProps {
  params: {
    role: "beginner" | "intermediate" | "advanced"
  }
}

export default function CoursePage({ params }: CoursePageProps) {
  return (
    <AuthGuard requiredRole={params.role}>
      <DashboardLayout role={params.role}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground capitalize">{params.role} Courses</h1>
              <p className="text-muted-foreground">Explore courses designed for your skill level</p>
            </div>
          </div>

          <CourseFilters />
          <CourseGrid role={params.role} />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
