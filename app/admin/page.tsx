"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  DocumentData,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    resources: 0,
    announcements: 0,
    projects: 0,
  });

  const [recentActivity, setRecentActivity] = useState<DocumentData[]>([]);
  const [announcements, setAnnouncements] = useState<DocumentData[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const coursesSnap = await getDocs(collection(db, "courses"));
        const announcementsSnap = await getDocs(collection(db, "announcements"));
        const projectsSnap = await getDocs(collection(db, "projects"));

        setStats({
          users: usersSnap.size,
          resources: coursesSnap.size,
          announcements: announcementsSnap.size,
          projects: projectsSnap.size,
        });

        const recentActivityQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"), limit(3));
        const activitySnap = await getDocs(recentActivityQuery);
        setRecentActivity(activitySnap.docs.map((doc) => doc.data()));

        const recentAnnouncementsQuery = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(2));
        const announcementsSnap2 = await getDocs(recentAnnouncementsQuery);
        setAnnouncements(announcementsSnap2.docs.map((doc) => doc.data()));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Welcome back,{" "}
            <span className="font-semibold">{user?.displayName || "Admin"}</span> 👋
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
            Role: Admin
          </span>
        </section>

        {/* Key Stats */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard emoji="👥" value={stats.users} label="Total Students" />
            <StatCard emoji="📚" value={stats.resources} label="Resources Uploaded" />
            <StatCard emoji="📢" value={stats.announcements} label="Announcements Posted" />
            <StatCard emoji="🛠️" value={stats.projects} label="Projects Submitted" />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Recent Student Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity yet.</p>
          ) : (
            <ul className="divide-y divide-muted">
              {recentActivity.map((act, i) => (
                <li key={i} className="py-2 flex items-start">
                  <span className="mr-2 text-lg">📝</span>
                  <span>
                    <strong>{act.submittedBy || "Unknown Student"}</strong>{" "}
                    submitted <strong>{act.title}</strong>{" "}
                    <span className="text-muted-foreground text-xs ml-2">
                      {act.createdAt?.toDate
                        ? act.createdAt.toDate().toLocaleString()
                        : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Announcements */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Announcements</h2>
            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition">
              Post New Announcement
            </button>
          </div>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-muted-foreground text-sm">No announcements yet.</p>
            ) : (
              announcements.map((a, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded shadow p-3">
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-sm text-muted-foreground">{a.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {a.createdAt?.toDate
                      ? a.createdAt.toDate().toLocaleString()
                      : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}

function StatCard({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 flex items-center space-x-3">
      <span className="text-2xl">{emoji}</span>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}