"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";

export default function Announcements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const fetchAnnouncements = async () => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async () => {
    if (!title.trim() || !message.trim()) return alert("Please fill in all fields.");
    setLoading(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title,
        message,
        createdAt: Timestamp.now(),
      });
      setTitle("");
      setMessage("");
      await fetchAnnouncements();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "announcements", id));
    await fetchAnnouncements();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Announcements</h1>
        <p className="text-muted-foreground">Post and manage announcements</p>
      </div>

      <div className="space-y-4 border rounded-lg p-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Write your announcement..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
        <Button onClick={handlePost} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Announcement"}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-gray-500">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{a.title}</h3>
                <p className="text-gray-700">{a.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {a.createdAt?.toDate().toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(a.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}