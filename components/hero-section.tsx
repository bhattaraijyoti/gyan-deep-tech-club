"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Palette, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Animation for each letter
const textVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
}

export function HeroSection() {
  const heading1 = "Learn Tech."
  const heading2 = "Build Future."

  return (
    <section className="relative bg-gradient-to-b from-background to-muted min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Navbar */}
        <nav className="absolute top-8 left-0 right-0 flex justify-between items-center">
          <div className="text-sm font-mono text-muted-foreground">Gyan Deep</div>
        </nav>

        {/* Hero Content */}
        <div className="text-center space-y-16 pt-24">
          <div className="space-y-8">
            <div className="relative">
              <h2 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-balance leading-tight drop-shadow-lg">
                {/* First line animation */}
                {heading1.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={textVariant}
                    initial="hidden"
                    animate="visible"
                    className="inline-block text-foreground"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
                <br />
                {/* Second line animation */}
                {heading2.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    variants={textVariant}
                    initial="hidden"
                    animate="visible"
                    className="inline-block gradient-text"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </h2>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed drop-shadow-sm">
                {
                  "Where curious minds converge to explore the intersection of technology and creativity. We don't just teach code—we cultivate digital artisans."
                }
              </p>

              <div className="flex items-center justify-center gap-8 text-sm font-mono text-muted-foreground">
                <span>Learn</span>
                <div className="w-8 h-px bg-border"></div>
                <span>Create</span>
                <div className="w-8 h-px bg-border"></div>
                <span>Inspire</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-base font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Link href="/join">
                Join the Collective
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 text-base font-medium rounded-lg border-border hover:bg-accent/10  transition-all duration-300 hover:border-accent bg-transparent shadow-lg hover:shadow-xl hover:text-black"
            >
              <Link href="/resources" title="Explore curated learning materials and tools">View Resources</Link>
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 pt-16 border-t border-border">
          <div className="text-center space-y-6 group transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center mx-auto group-hover:border-primary shadow-md hover:shadow-xl transition-shadow duration-300">
              <Code className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors duration-300">
                Craft & Logic
              </h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                {
                  "Master the art of clean code through hands-on projects that challenge both your technical skills and creative thinking."
                }
              </p>
            </div>
          </div>

          <div className="text-center space-y-6 group transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center mx-auto group-hover:border-accent shadow-md hover:shadow-xl transition-shadow duration-300">
              <Palette className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors duration-300">
                Design Thinking
              </h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                {
                  "Blend aesthetic sensibility with functional design. Learn to create experiences that are both beautiful and purposeful."
                }
              </p>
            </div>
          </div>

          <div className="text-center space-y-6 group transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center mx-auto group-hover:border-chart-4 shadow-md hover:shadow-xl transition-shadow duration-300">
              <Zap className="w-8 h-8 text-chart-4" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors duration-300">
                Innovation Lab
              </h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">
                {
                  "Experiment with emerging technologies and push boundaries. From AI to web3, explore what's next in digital creation."
                }
              </p>
            </div>
          </div>
        </div>

        <br />
        <br />
      </div>
    </section>
  )
}
