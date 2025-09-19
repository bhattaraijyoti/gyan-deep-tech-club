
import { AuthForm } from "@/components/auth/auth-form"

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-background">

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Start Your Journey in Tech Today</h1>
            <p className="text-muted-foreground">
              Choose your level and learn with us. Join the Gyan Deep Tech Club community and unlock your potential in
              technology.
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </main>
  )
}
