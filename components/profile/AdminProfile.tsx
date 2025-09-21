

"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function AdminProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 flex justify-center items-start py-12 px-4">
      <div className="backdrop-blur-md bg-white/80 dark:bg-black/30 rounded-2xl shadow-xl p-8 max-w-lg w-full border border-white/30">
        <div className="flex flex-col items-center">
          <img
            src={user.profileImageUrl || "/default-avatar.png"}
            alt="Admin Avatar"
            className="w-32 h-32 rounded-full border-4 border-primary mb-4 object-cover shadow-lg"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
            {user.firstName || 'Admin'} {user.lastName || ''}
          </h1>
          <p className="text-muted-foreground mb-6 text-center break-all">{user.emailAddresses[0]?.emailAddress}</p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl py-3 font-semibold shadow-md transition-all">
              Edit Profile
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-500/90 hover:to-yellow-700/90 text-white rounded-xl py-3 font-semibold shadow-md transition-all">
              Manage Users
            </Button>
            <SignOutButton>
              <Button className="flex-1 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-500/90 hover:to-red-700/90 text-white rounded-xl py-3 font-semibold shadow-md transition-all">
                Logout
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
}