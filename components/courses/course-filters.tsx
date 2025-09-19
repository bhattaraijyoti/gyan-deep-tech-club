"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

export function CourseFilters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const availableTags = [
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "HTML",
    "CSS",
    "Git",
    "Database",
    "SQL",
    "API",
    "DevOps",
    "Cloud",
    "ML",
  ]

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedTags([])
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Filter by Tags</h3>
              {(selectedTags.length > 0 || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(selectedTags.length > 0 || searchTerm) && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Search: "{searchTerm}"</span>
              <X className="w-3 h-3 cursor-pointer hover:text-foreground" onClick={() => setSearchTerm("")} />
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
              <span>{tag}</span>
              <X className="w-3 h-3 cursor-pointer hover:text-foreground" onClick={() => toggleTag(tag)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
