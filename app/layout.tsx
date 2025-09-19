import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Footer } from "@/components/footer"
import "./globals.css"

// Clerk imports
import { ClerkProvider } from "@clerk/nextjs"
import {Navigation} from "@/components/navigation"

export const metadata: Metadata = {
  title: "Gyan Deep Tech Club - Future of Learning",
  description: "Join our tech club for peer-to-peer learning, cutting-edge technology, and collaborative innovation.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{ 
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
          <Navigation />
          <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
            {children}
          </Suspense>
          <Footer />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}