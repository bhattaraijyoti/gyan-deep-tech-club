

"use client";

import React from "react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Welcome to Your Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <p className="text-gray-700">View and edit your profile information.</p>
        </div>

        {/* Card 2 */}  
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          <p className="text-gray-700">Manage and track your projects.</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Settings</h2>
          <p className="text-gray-700">Customize your preferences and account settings.</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-gray-700">View performance statistics and insights.</p>
        </div>

        {/* Card 5 */}
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Notifications</h2>
          <p className="text-gray-700">Check recent alerts and messages.</p>
        </div>

        {/* Card 6 */}
        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Support</h2>
          <p className="text-gray-700">Get help and support from our team.</p>
        </div>
      </div>
    </div>
  );
}