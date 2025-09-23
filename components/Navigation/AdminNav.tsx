"use client";

import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

type User = {
  displayName?: string | null;
  email?: string | null;
};

export default function AdminNav({ user }: { user: User }) {
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <h1 className="font-bold text-lg">Admin Dashboard</h1>
      <div className="flex items-center gap-6">
        <ul className="flex gap-6">
          <li>
            <Link href="/admin" className="hover:text-gray-300">
              Home
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className="hover:text-gray-300">
              Manage Users
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="hover:text-gray-300">
              Settings
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-4">
          {user?.displayName || user?.email ? (
            <span className="text-sm">{user.displayName || user.email}</span>
          ) : null}
          <button
            onClick={() => signOut(auth)}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}