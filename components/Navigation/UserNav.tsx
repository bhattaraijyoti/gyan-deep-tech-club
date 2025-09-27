"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon } from "lucide-react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface UserNavProps {
  user: User;
}

export default function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Gyan Tech Club</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/user/dashboard" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105">
              Dashboard
            </Link>
            <Link href="/user/courses" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105">
              Courses
            </Link>
            <Link href="/resources" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105">
              Resources
            </Link>
            <Link href="/user/announcements" className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105">
              Announcements
            </Link>

            <div className="relative">
              <Link href="/profile">
                <img
                  src={
                    user.photoURL ||
                    "/default-avatar.png"
                  }
                  alt="Profile"
                  className="w-11 h-11 rounded-full cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110"
                />
              </Link>
            </div>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="hover:bg-primary/10">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-6 space-y-4 glass-strong rounded-b-2xl mt-2 animate-scale-in">
            <Link href="/dashboard" className="block text-muted-foreground hover:text-primary transition-colors font-medium py-3 px-4 rounded-lg hover:bg-primary/5" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
            <Link href="/courses" className="block text-muted-foreground hover:text-primary transition-colors font-medium py-3 px-4 rounded-lg hover:bg-primary/5" onClick={() => setIsOpen(false)}>
              Courses
            </Link>
            <Link href="/announcements" className="block text-muted-foreground hover:text-primary transition-colors font-medium py-3 px-4 rounded-lg hover:bg-primary/5" onClick={() => setIsOpen(false)}>
              Announcements
            </Link>
            {/* Link to dynamic profile page (renders UserProfile or AdminProfile) */}
            <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white mt-4 rounded-xl">
              <Link href="/profile" onClick={() => setIsOpen(false)}>
                Profile
              </Link>
            </Button>
            <Button
              onClick={() => auth.signOut()}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white mt-4 rounded-xl"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}