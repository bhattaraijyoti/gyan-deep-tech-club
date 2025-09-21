import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Sparkles, Rocket, Brain } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative py-24 lg:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-primary/5" />

      {/* Floating elements */}
      <div className="floating-element floating-element-1">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-float" />
      </div>
      <div className="floating-element floating-element-2">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 animate-float" />
      </div>
      <div className="floating-element floating-element-3">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 animate-float" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-12 animate-fade-in-up">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6 animate-scale-in">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Welcome to the Future of Learning</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-balance leading-tight">
              <span className="text-foreground">Learn Tech.</span> <span className="gradient-text">Build Future.</span>
            </h1>

            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Join Gyan Deep Tech Club where students learn, collaborate, and grow together in technology. From your
              first line of code to advanced AI projects.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-10 py-4 text-lg rounded-2xl hover-lift hover-glow transition-all duration-300"
            >
              <Link href="/join">
                Get Started
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-10 py-4 text-lg rounded-2xl glass border-primary/30 hover:bg-primary/5 hover:text-black hover-lift transition-all duration-300 bg-transparent"
            >
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="text-center space-y-6 p-8 rounded-3xl glass hover-lift hover-glow transition-all duration-500 group">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Peer Learning</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Learn from and teach fellow students in our collaborative environment with real-time support
            </p>
          </div>

          <div className="text-center space-y-6 p-8 rounded-3xl glass hover-lift hover-glow transition-all duration-500 group">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Smart Progression</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              AI-powered learning paths that adapt to your pace through beginner, intermediate, and advanced levels
            </p>
          </div>

          <div className="text-center space-y-6 p-8 rounded-3xl glass hover-lift hover-glow transition-all duration-500 group">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <Rocket className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Real Projects</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Build production-ready applications and gain hands-on experience with cutting-edge technology
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold gradient-text">500+</div>
            <div className="text-muted-foreground">Active Students</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold gradient-text">50+</div>
            <div className="text-muted-foreground">Courses</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold gradient-text">95%</div>
            <div className="text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold gradient-text">24/7</div>
            <div className="text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}
