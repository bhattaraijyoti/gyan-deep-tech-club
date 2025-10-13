"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // <-- import
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon } from "lucide-react";
import { User } from "firebase/auth";

interface UserNavProps {
  user: User;
}

export default function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // <-- get current path

  if (!user) return null;

  const navLinks = [
    { href: "/user", label: "Dashboard" },
    { href: "/user/courses", label: "Courses" },
    { href: "/resources", label: "Resources" },
    { href: "/user/announcements", label: "Announcements" },
  ];

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

          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-all duration-300 font-medium text-lg hover:scale-105 ${
                  pathname === link.href
                    ? "text-primary" // current page color
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="relative">
              <Link href="/profile">
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="Profile"
                  className="w-11 h-11 rounded-full cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110"
                />
              </Link>
            </div>
          </div>

          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-primary/10"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden py-6 space-y-4 glass-strong rounded-b-2xl mt-2 animate-scale-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block transition-colors font-medium py-3 px-4 rounded-lg ${
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Button
              asChild
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white mt-4 rounded-xl"
            >
              <Link href="/profile" onClick={() => setIsOpen(false)}>
                Profile
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}