import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LessonViewer } from "@/components/courses/lesson-viewer"
import { LessonNavigation } from "@/components/courses/lesson-navigation"

interface LessonPageProps {
  params: {
    role: "beginner" | "intermediate" | "advanced"
    courseId: string
    lessonId: string
  }
}

export default function LessonPage({ params }: LessonPageProps) {
  return (
    <AuthGuard requiredRole={params.role}>
      <DashboardLayout role={params.role}>
        <div className="space-y-6">
          <LessonNavigation courseId={params.courseId} lessonId={params.lessonId} role={params.role} />
          <LessonViewer lessonId={params.lessonId} courseId={params.courseId} role={params.role} />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
