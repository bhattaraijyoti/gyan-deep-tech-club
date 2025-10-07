"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: Timestamp;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user + admin check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const adminEmails = ["admin@example.com", "principal@example.com"];
        setIsAdmin(adminEmails.includes(currentUser.email || ""));
      } else {
        router.replace("/unauthorized");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Announcement[];
    setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Post new announcement (admin only)
  const handlePost = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title,
        message,
        createdAt: Timestamp.now(),
        createdBy: user?.email,
      });
      toast.success("Announcement posted!");
      setTitle("");
      setMessage("");
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
      toast.error("Failed to post announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">📢 Announcements</h1>

      {isAdmin && (
        <Card className="p-4 space-y-3 shadow-sm border">
          <h2 className="text-lg font-semibold">Create Announcement</h2>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write your message..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={handlePost} disabled={loading}>
            {loading ? "Posting..." : "Post Announcement"}
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-center text-gray-500">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <Card key={a.id} className="p-4">
              <h3 className="text-lg font-semibold">{a.title}</h3>
              <p className="text-gray-700 whitespace-pre-wrap mt-2">{a.message}</p>
              <p className="text-sm text-gray-400 mt-3">
                Posted on {a.createdAt.toDate().toLocaleString()} by {a.createdBy || "Admin"}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}