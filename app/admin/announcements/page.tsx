"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import Announcements from "@/components/admin/announcements";

export default function AdminAnnouncementsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-6">
        <Announcements />
      </div>
    </AuthGuard>
  );
}