import { Navigation } from "@/components/Navigation/navigation"
import { Card } from "@/components/ui/card"
import { BookOpen, Users, Wrench, Star } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
  

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gyan Deep Tech Club
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Building the future of technology education through collaborative learning and innovation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              To create a collaborative learning space where students inspire each other and grow in technology. We
              believe that the best learning happens when students teach and learn from one another.
            </p>
          </Card>

          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Every student, regardless of skill level, should feel confident to explore, learn, and share tech
              knowledge. We're building a community where curiosity thrives and innovation flourishes.
            </p>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group hover:scale-105">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Learn 📚</h3>
              <p className="text-muted-foreground">Continuous learning and growth in technology</p>
            </Card>

            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group hover:scale-105">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Teach 🤝</h3>
              <p className="text-muted-foreground">Share knowledge and help others succeed</p>
            </Card>

            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group hover:scale-105">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Build 🛠️</h3>
              <p className="text-muted-foreground">Create real projects and practical solutions</p>
            </Card>

            <Card className="p-6 text-center bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group hover:scale-105">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <Star className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Inspire 🌟</h3>
              <p className="text-muted-foreground">Motivate others to reach their potential</p>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Join Our Community</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Ready to start your journey in technology? Join hundreds of students who are already learning, building,
              and growing together.
            </p>
            <a
              href="/join"
             className="inline-flex w-auto items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Get Started Today
            </a>
          </Card>
        </div>
      </div>
    </main>
  )
}
