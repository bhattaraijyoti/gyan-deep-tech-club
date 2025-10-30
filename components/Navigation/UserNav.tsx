"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // <-- import useRouter
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon } from "lucide-react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export default function UserNav() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);
  const [newAnnouncementCount, setNewAnnouncementCount] = useState(0);
  const pathname = usePathname(); // <-- get current path
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && (pathname === "/login" || pathname === "/signup")) {
        router.replace("/user");
      }
    });
    return () => unsubscribe();
  }, [pathname, router]);

  useEffect(() => {
    const checkAnnouncements = async () => {
      try {
        const db = getFirestore();
        const lastSeen = parseInt(localStorage.getItem("lastSeenAnnouncement") || "0", 10);

        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        let count = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toMillis?.() || 0;
          if (createdAt > lastSeen) count++;
        });

        if (count > 0) {
          setHasNewAnnouncement(true);
          setNewAnnouncementCount(count);
        } else {
          setHasNewAnnouncement(false);
          setNewAnnouncementCount(0);
        }
      } catch (error) {
        console.error("Error checking announcements:", error);
      }
    };

    checkAnnouncements();
  }, []);

  useEffect(() => {
    if (pathname === "/user/announcements") {
      localStorage.setItem("lastSeenAnnouncement", Date.now().toString());
      setHasNewAnnouncement(false);
      setNewAnnouncementCount(0);
    }
  }, [pathname]);

  if (user === undefined) return null;
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

          <div className="hidden lg:flex items-center space-x-8">
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
                <span className="relative">
                  {link.label}
                  {link.href === "/user/announcements" && hasNewAnnouncement && (
                    <span className="absolute -top-3 -right-4 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse min-w-[18px] text-center">
                      {newAnnouncementCount}
                    </span>
                  )}
                </span>
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
            <button
              aria-label="Toggle menu"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
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
                <span className="relative">
                  {link.label}
                  {link.href === "/user/announcements" && hasNewAnnouncement && (
                    <span className="absolute -top-3 -right-4 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse min-w-[18px] text-center">
                      {newAnnouncementCount}
                    </span>
                  )}
                </span>
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