"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UserProfile from "@/components/profile/UserProfile";

interface User {
  id: string;
  name?: string;
  email: string;
  roles?: string[]; // supports multiple roles
  photoURL?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userData: User[] = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
          roles: docSnap.data().roles || [docSnap.data().role || "student"],
        })) as User[];
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeleting(userId);
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  return (
    <AuthGuard requiredRole="admin">
      <div className="max-w-6xl mx-auto p-6 mt-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">View and manage all registered users</p>
          </div>
          <input
            type="text"
            placeholder="Search users by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[60vh] text-gray-500">
            <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No users found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="shadow-sm">
                <CardHeader className="flex items-center gap-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name || "User"}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg">
                      {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="text-lg font-semibold">{user.name || "—"}</div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-700 break-words">{user.email}</p>
                  <div className="flex gap-2 flex-wrap">
                    {(user.roles || ["student"]).map((role) => (
                      <Badge
                        key={role}
                        className={`capitalize ${
                          role === "admin"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserProfile(true);
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      disabled={deleting === user.id}
                      className="flex items-center gap-1"
                    >
                      {deleting === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {deleting === user.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* UserProfile Modal */}
        {showUserProfile && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-5xl h-full overflow-auto rounded-lg shadow-lg relative">
              <button
                onClick={() => setShowUserProfile(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                &times;
              </button>

              <UserProfile user={selectedUser} />
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}