import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CourseHeader } from "@/components/courses/course-header"
import { LessonList } from "@/components/courses/lesson-list"
import { CourseProgress } from "@/components/courses/course-progress"

interface CourseDetailPageProps {
  params: {
    role: "beginner" | "intermediate" | "advanced"
    courseId: string
  }
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  return (
    <AuthGuard requiredRole={params.role}>
      <DashboardLayout role={params.role}>
        <div className="space-y-6">
          <CourseHeader courseId={params.courseId} role={params.role} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LessonList courseId={params.courseId} role={params.role} />
            </div>
            <div>
              <CourseProgress courseId={params.courseId} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
