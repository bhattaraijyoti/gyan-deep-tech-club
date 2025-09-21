"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Search, Code, Palette, BookOpen, Wrench, Cloud } from "lucide-react"
const resources = [
    // Development
    {
      id: 1,
      name: "GitHub",
      description: "Version control and collaboration platform for developers",
      url: "https://github.com",
      category: "Development",
      logo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    },
    {
      id: 2,
      name: "Stack Overflow",
      description: "Q&A platform for programmers and developers",
      url: "https://stackoverflow.com",
      category: "Development",
      logo: "https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/so/so-icon.svg",
    },
  
    // Design
    {
      id: 3,
      name: "Figma",
      description: "Collaborative interface design tool",
      url: "https://figma.com",
      category: "Design",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    },
    {
      id: 4,
      name: "Canva",
      description: "Graphic design platform for creating visual content",
      url: "https://canva.com",
      category: "Design",
      logo: "https://freelogopng.com/images/all_img/1656733807canva-icon-png.png",
    },
    {
      id: 5,
      name: "Dribbble",
      description: "Design inspiration and portfolio platform",
      url: "https://dribbble.com",
      category: "Design",
      logo: "data:image/jpeg;base64,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",
    },
  
    // Learning
    {
      id: 6,
      name: "W3Schools",
      description: "Web development tutorials and references",
      url: "https://w3schools.com",
      category: "Learning",
      logo: "https://www.w3schools.com/images/w3schools_logo_436_2.png",
    },
  
    // Hosting/Cloud
    {
      id: 7,
      name: "Firebase",
      description: "Google's mobile and web application development platform",
      url: "https://firebase.google.com",
      category: "Hosting/Cloud",
      logo: "https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png",
    },
    {
      id: 8,
      name: "Vercel",
      description: "Platform for frontend frameworks and static sites",
      url: "https://vercel.com",
      category: "Hosting/Cloud",
      logo: "https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png",
    },
  
    // Tools
    {
      id: 9,
      name: "VS Code",
      description: "Lightweight but powerful source code editor",
      url: "https://code.visualstudio.com",
      category: "Tools",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg",
    },
  ]

const categories = [
  { name: "All", icon: null },
  { name: "Development", icon: Code },
  { name: "Design", icon: Palette },
  { name: "Learning", icon: BookOpen },

  { name: "Hosting/Cloud", icon: Cloud },
  { name: "Tools", icon: Wrench },
]

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">Resources & Tools</h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            Curated collection of essential tools and resources for students and tech learners in Nepal
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className="flex items-center gap-2"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={resource.logo || "/placeholder.svg"}
                      alt={`${resource.name} logo`}
                      className="h-10 w-10 rounded-lg"
                    />
                    <div>
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {resource.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm">{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full hover:bg-[#66A6B2] transition-colors">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No resources found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("All")
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
