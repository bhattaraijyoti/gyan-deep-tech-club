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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/login"; // redirect to login after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="flex justify-between items-center h-20 px-6">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
            <UserIcon className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Gyan Tech Club</span>
        </Link>

        <div className="relative">
          <Button onClick={() => setIsOpen(!isOpen)}>
            Menu
          </Button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg p-4 flex flex-col">
              <Link href="/profile">
                <img
                  src={user.photoURL || "/default-avatar.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full mb-2"
                />
                <span>{user.email}</span>
              </Link>
              <Button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white mt-4 rounded-xl"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}