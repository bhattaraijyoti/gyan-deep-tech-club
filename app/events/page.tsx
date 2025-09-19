
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

export default function EventsPage() {
  const pastEvents = [
    {
      title: "Introduction to Web Development",
      date: "March 15, 2024",
      description: "A comprehensive workshop covering HTML, CSS, and basic JavaScript fundamentals.",
      attendees: 45,
      type: "Workshop",
    },
    {
      title: "AI Basics for Beginners",
      date: "February 28, 2024",
      description: "Exploring the fundamentals of artificial intelligence and machine learning concepts.",
      attendees: 38,
      type: "Seminar",
    },
    {
      title: "Git & GitHub Masterclass",
      date: "February 10, 2024",
      description: "Version control essentials for collaborative software development.",
      attendees: 52,
      type: "Workshop",
    },
  ]

  const upcomingEvents = [
    {
      title: "React.js Deep Dive",
      date: "April 20, 2024",
      time: "2:00 PM - 5:00 PM",
      description: "Advanced React concepts including hooks, context, and state management.",
      location: "Computer Lab A",
      type: "Workshop",
    },
    {
      title: "Tech Career Panel Discussion",
      date: "May 5, 2024",
      time: "3:00 PM - 4:30 PM",
      description: "Industry professionals share insights about tech careers and opportunities.",
      location: "Main Auditorium",
      type: "Panel",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Tech Club{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Events</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our workshops, seminars, and networking events to enhance your tech skills and connect with fellow
            learners
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Upcoming Events</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {event.type}
                  </Badge>
                  <Badge variant="outline" className="text-accent border-accent/30">
                    Upcoming
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">{event.title}</h3>
                <p className="text-muted-foreground mb-4">{event.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Register for Event
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event, index) => (
              <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-border">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    {event.type}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                    Completed
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-3">{event.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{event.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {event.attendees} attendees
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Want to Attend Our Events?</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Students can join events after signing up for the Tech Club. Get access to exclusive workshops, seminars,
              and networking opportunities.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href="/join">Join the Club</a>
            </Button>
          </Card>
        </div>
      </div>
    </main>
  )
}
