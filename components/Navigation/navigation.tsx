"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Code2 } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Gyan Deep Tech</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              About
            </Link>
            <Link
              href="/resources"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              Resources
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              Contact
            </Link>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-6 py-2 rounded-xl hover-glow transition-all duration-300"
            >
              <Link href="/join">Join Club</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="hover:bg-primary/10">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-6 space-y-4 glass-strong rounded-b-2xl mt-2 animate-scale-in">
            <Link
              href="/"
              className="block text-muted-foreground hover:text-primary transition-colors font-medium py-3 px-4 rounded-lg hover:bg-primary/5"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block text-muted-foreground hover:text-primary transition-colors font-medium py-3 px-4 rounded-lg hover:bg-primary/5"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
          
            <Link
              href="/resources"
              className="block text-muted-foreground hover:text-primary transition-colors font-medium py-3 px-4 rounded-lg hover:bg-primary/5"
              onClick={() => setIsOpen(false)}
            >
              Resources
            </Link>
            <Link
              href="/contact"
              className="block text-muted-foreground hover:text-primary transition-colors font-medium py-3 px-4 rounded-lg hover:bg-primary/5"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white mt-4 rounded-xl"
            >
              <Link href="/join" onClick={() => setIsOpen(false)}>
                Join Club
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
