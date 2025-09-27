import { AuthGuard } from "@/components/auth/auth-guard"

export default function AdminDashboard() {
  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard (No Events)</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Welcome back, <span className="font-semibold">Admin Name</span> 👋
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
            Role: Admin
          </span>
        </section>

        {/* Key Stats (Overview Cards) */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 flex items-center space-x-3">
              <span className="text-2xl">👥</span>
              <div>
                <div className="text-2xl font-bold">120</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 flex items-center space-x-3">
              <span className="text-2xl">📚</span>
              <div>
                <div className="text-2xl font-bold">48</div>
                <div className="text-sm text-muted-foreground">Resources Uploaded</div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 flex items-center space-x-3">
              <span className="text-2xl">📢</span>
              <div>
                <div className="text-2xl font-bold">9</div>
                <div className="text-sm text-muted-foreground">Announcements Posted</div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 flex items-center space-x-3">
              <span className="text-2xl">🛠️</span>
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Projects Submitted</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition">
              Add Resource
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition">
              Post Announcement
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium transition">
              Manage Students
            </button>
          </div>
        </section>

        {/* Recent Student Activity */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Recent Student Activity</h2>
          <ul className="divide-y divide-muted">
            <li className="py-2 flex items-start">
              <span className="mr-2 text-lg">📝</span>
              <span><strong>Samir R.</strong> submitted a project proposal <span className="text-muted-foreground text-xs ml-2">2 hours ago</span></span>
            </li>
            <li className="py-2 flex items-start">
              <span className="mr-2 text-lg">💬</span>
              <span><strong>Priya S.</strong> commented on an announcement <span className="text-muted-foreground text-xs ml-2">4 hours ago</span></span>
            </li>
            <li className="py-2 flex items-start">
              <span className="mr-2 text-lg">📥</span>
              <span><strong>Rohit D.</strong> downloaded a resource <span className="text-muted-foreground text-xs ml-2">Yesterday</span></span>
            </li>
          </ul>
        </section>

        {/* Announcements Panel */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Announcements</h2>
            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition">
              Post New Announcement
            </button>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-zinc-900 rounded shadow p-3">
              <div className="font-semibold">Club Meeting on Friday</div>
              <div className="text-sm text-muted-foreground">Don’t forget our weekly meeting at 5pm in Room 203.</div>
              <div className="text-xs text-muted-foreground mt-1">Posted 1 day ago</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded shadow p-3">
              <div className="font-semibold">New Resources Available</div>
              <div className="text-sm text-muted-foreground">Check out the latest Python tutorials uploaded to the resources section.</div>
              <div className="text-xs text-muted-foreground mt-1">Posted 3 days ago</div>
            </div>
          </div>
        </section>

        {/* Project Highlights */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Project Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded shadow p-4">
              <div className="font-semibold mb-1">Pending project approvals</div>
              <ul className="list-disc ml-4 text-sm text-muted-foreground">
                <li>AI Chatbot by Samir R.</li>
                <li>Club Website Revamp by Priya S.</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded shadow p-4">
              <div className="font-semibold mb-1">Featured project of the month</div>
              <div className="text-sm text-muted-foreground">
                <strong>Smart Attendance System</strong> by Rohit D.<br />
                An automated attendance system using QR codes and Google Sheets integration.
              </div>
            </div>
          </div>
        </section>
      </div>
    </AuthGuard>
  )
}