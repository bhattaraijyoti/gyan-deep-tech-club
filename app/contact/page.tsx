"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mail, MessageSquare, Send, Github, Linkedin, Twitter } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  })
  const [user, setUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const auth = getAuth()

  // Get logged-in user (if any) and prefill email & name
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [auth])

  // Update formData when user changes to prefill name and email
  useEffect(() => {
    if (user) {
      setFormData({
        subject: "",
        message: "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to send a message.",
      })
      return
    }

    // Basic validation
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out both subject and message.",
      })
      return
    }

    if (!user.email || !isValidEmail(user.email)) {
      toast({
        title: "Invalid Email",
        description: "Your account email is invalid. Please update your email.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await addDoc(collection(db, "messages"), {
        userId: user.uid,
        name: user.displayName || "Anonymous",
        email: user.email,
        subject: formData.subject,
        message: formData.message,
        createdAt: Timestamp.now(),
      })

      toast({
        title: "Message sent!",
        description: "Thank you for your feedback. We'll get back to you soon.",
      })

      // Reset subject and message
      setFormData({
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: "Could not send message. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">Get In Touch</h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            Have suggestions for new resources? Found a broken link? Want to contribute? We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form or Login Prompt */}
          {user ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Send us a message
                </CardTitle>
                <CardDescription>
                  Share your feedback, suggestions, or report any issues you've encountered.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={user.displayName || "Anonymous"}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={user.email || ""}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your feedback or suggestion..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full cursor-pointer hover:bg-[#26667F]" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : <>
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Please log in to send a message</CardTitle>
                <CardDescription>You must be logged in to contact us. Please log in to continue.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">You need to be logged in to send a message through this form.</p>
              </CardContent>
            </Card>
          )}

          {/* Contact Info & Social Links */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Other ways to reach us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">For general inquiries: hello@bcastudenthub.np</p>
                  <p className="text-muted-foreground">For resource suggestions: resources@bcastudenthub.np</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Response Time</h3>
                  <p className="text-muted-foreground">We typically respond within 24–48 hours during weekdays.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connect with us</CardTitle>
                <CardDescription>Follow us on social media for updates and tech news</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline" size="icon" asChild className="cursor-pointer hover:bg-[#26667F]">
                    <a href="#" target="_blank" rel="noopener noreferrer"><Github className="h-4 w-4" /></a>
                  </Button>
                  <Button variant="outline" size="icon" asChild className="cursor-pointer hover:bg-[#26667F]">
                    <a href="#" target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" /></a>
                  </Button>
                  <Button variant="outline" size="icon" asChild className="cursor-pointer hover:bg-[#26667F]">
                    <a href="#" target="_blank" rel="noopener noreferrer"><Twitter className="h-4 w-4" /></a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
