"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function UserHomePage() {
  const sections = [
    {
      id: 1,
      title: "Courses",
      description: "Explore all available courses and track your progress.",
      link: "/user/courses",
      badge: "Learning",
    },
    {
      id: 2,
      title: "Resources",
      description: "Access curated tools and resources for students.",
      link: "/user/resources",
      badge: "Tools",
    },
    {
      id: 3,
      title: "Announcements",
      description: "Stay updated with the latest announcements and updates.",
      link: "/user/announcements",
      badge: "Info",
    },
  ];

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 py-16 px-6 sm:px-10 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <header className="text-center max-w-4xl mx-auto space-y-2 mb-12">
            <h1 className="text-5xl font-bold text-[#26667F]">Welcome to Gyan Tech Club</h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Explore courses, resources, and announcements to enhance your skills and stay up to date.
            </p>
          </header>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section) => (
              <Card key={section.id} className="hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-[#26667F]">{section.title}</CardTitle>
                  <Badge variant="secondary" className="bg-[#66A6B2] text-white uppercase text-xs mt-2">{section.badge}</Badge>
                </CardHeader>
                <CardContent className="flex flex-col justify-between space-y-4">
                  <p className="text-gray-700">{section.description}</p>
                  <Button asChild variant="default" className="mt-auto hover:bg-[#66A6B2]">
                    <Link href={section.link}>Go</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}