"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Code,
  Bell,
  Users,
  BarChart3,
  Sparkles,
  MoveLeftIcon,
  MoveRightIcon,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "beginner" | "intermediate" | "advanced" | "admin"
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "beginner":
        return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
      case "intermediate":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
      case "advanced":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
      case "admin":
        return "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
    }
  }

  const getNavigation = (role: string) => {
    if (role === "admin") {
      return [
        { name: "Dashboard", href: "/admin", icon: Home },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Courses", href: "/admin/courses", icon: BookOpen },
        { name: "Chats", href: "/admin/chats", icon: MessageSquare },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ]
    }

    return [
      { name: "Dashboard", href: `/dashboard/${role}`, icon: Home },
      { name: "Courses", href: `/courses/${role}`, icon: BookOpen },
      { name: "Chat", href: "/chats/general", icon: MessageSquare },
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }

  const navigation = getNavigation(role)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 shadow-2xl transform transition-all duration-500 ease-out flex flex-col
          ${sidebarOpen ? "w-72" : "w-16"}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10 dark:border-slate-700/50">
          {sidebarOpen ? (
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-purple-500/25">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Gyan Deep
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tech Club</p>
              </div>
            </Link>
          ) : (
            <div className="w-12 h-12 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-slate-800/50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <MoveLeftIcon className="w-5 h-5" /> : <MoveRightIcon className="w-5 h-5" />}
          </Button>
        </div>

       

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white hover:shadow-lg hover:scale-105 transition-all duration-300 group
                ${sidebarOpen ? "px-4 py-3" : "px-3 py-3 justify-center"}
              `}
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-6 border-t border-white/10 dark:border-slate-700/50">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300"
              onClick={() => {
                window.location.href = "/"
              }}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-500 ease-out ${
          sidebarOpen ? "lg:pl-[18rem]" : "lg:pl-16"
        }`}
      >
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 shadow-sm flex items-center justify-between px-6 py-4">
          {/* On large screens, hide the sidebar toggle button here */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-slate-800/50"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <MoveLeftIcon className="w-5 h-5" /> : <MoveRightIcon className="w-5 h-5" />}
            </Button>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-slate-800/50 relative"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </Button>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
