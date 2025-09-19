"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Code, Mail, Phone, MapPin, Github, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.6),transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-32 right-20 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-2000" />

      <div className="relative container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Gyan Deep
                </h3>
                <p className="text-sm text-gray-400">Tech Club</p>
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering the next generation of tech innovators through peer-to-peer learning and hands-on experience.
            </p>
            <div className="flex space-x-4">
              {[Github, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <nav className="space-y-3">
              {[
                { name: "About Us", href: "/about" },
                { name: "Courses", href: "/courses" },
                { name: "Events", href: "/events" },
                { name: "Join Club", href: "/join" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Learning Paths */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Learning Paths</h4>
            <nav className="space-y-3">
              {[
                { name: "Beginner Track", href: "/courses/beginner" },
                { name: "Intermediate Track", href: "/courses/intermediate" },
                { name: "Advanced Track", href: "/courses/advanced" },
                { name: "Study Groups", href: "/chats/general" },
                { name: "Mentorship", href: "/mentorship" },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
            <p className="text-gray-300 text-sm">Get the latest updates on new courses, events, and tech insights.</p>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>contact@gyandeep.tech</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-purple-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Tech Hub, Innovation District</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">© 2024 Gyan Deep Tech Club. All rights reserved.</div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
