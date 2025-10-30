"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { motion } from "framer-motion";

export default function UserHomePage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      link: "/resources",
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
      <main className="min-h-screen bg-gradient-to-br from-[#f0fdfa] to-[#e0f7fa] py-16 px-6 sm:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <header className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            {isMobile ? (
              <h1 className="text-5xl font-extrabold text-[#004d40] drop-shadow-md">
                Welcome to Gyan Tech Club
              </h1>
            ) : (
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-5xl font-extrabold text-[#004d40] drop-shadow-md"
              >
                Welcome to Gyan Tech Club
              </motion.h1>
            )}
            {isMobile ? (
              <p className="text-gray-800 text-lg max-w-xl mx-auto">
                Explore courses, resources, and announcements to enhance your skills and stay up to date.
              </p>
            ) : (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                className="text-gray-800 text-lg max-w-xl mx-auto"
              >
                Explore courses, resources, and announcements to enhance your skills and stay up to date.
              </motion.p>
            )}
          </header>

          {/* Sections Grid */}
          {isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {sections.map((section) => (
                <div key={section.id} className="rounded-lg">
                  <Card className="flex flex-col justify-between h-full shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-[#00796b]">{section.title}</CardTitle>
                      <Badge variant="secondary" className="bg-[#004d40] text-white uppercase text-xs mt-2">
                        {section.badge}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-between flex-grow space-y-6">
                      <p className="text-gray-700">{section.description}</p>
                      <Button asChild variant="default" className="mt-auto">
                        <Link href={section.link}>Go</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.2,
                  },
                },
                hidden: {},
              }}
            >
              {sections.map((section) => (
                <motion.div
                  key={section.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.12)" }}
                  className="rounded-lg"
                >
                  <Card className="flex flex-col justify-between h-full shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-[#00796b]">{section.title}</CardTitle>
                      <Badge variant="secondary" className="bg-[#004d40] text-white uppercase text-xs mt-2">
                        {section.badge}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-between flex-grow space-y-6">
                      <p className="text-gray-700">{section.description}</p>
                      <Button asChild variant="default" className="mt-auto">
                        <Link href={section.link}>Go</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}