"use client";

import Link from "next/link";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Menu, X } from "lucide-react";

type User = {
  displayName?: string | null;
  email?: string | null;
};

export default function AdminNav({ user }: { user: User }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo / Title */}
          <Link href="/admin" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Admin Dashboard</span>
          </Link>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              Home
            </Link>
            <Link
              href="/admin/users"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              Manage Users
            </Link>
       
            <Link
              href="/admin/courses"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              Courses
            </Link>
            <Link
              href="/admin/announcements"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              Announcements
            </Link>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col space-y-2 mt-2 bg-background rounded-xl p-4 border border-border/40 shadow-lg">
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg rounded-lg px-2 py-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/admin/users"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg rounded-lg px-2 py-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Manage Users
            </Link>
            <Link
              href="/admin/courses"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg rounded-lg px-2 py-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              href="/admin/announcements"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg rounded-lg px-2 py-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Announcements
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}