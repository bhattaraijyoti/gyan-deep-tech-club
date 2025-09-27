// app/beginner/page.tsx
"use client"

import { useEffect, useState } from "react"

type Resource = {
  id: string
  title: string
  url: string
  type: "youtube" | "link"
}

export default function BeginnerPage() {
  const [resources, setResources] = useState<Resource[]>([])

  // For now let's use static dummy data
  useEffect(() => {
    setResources([
      {
        id: "1",
        title: "Intro to Programming",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        type: "youtube",
      },
      {
        id: "2",
        title: "Basic GitHub Guide",
        url: "https://github.com",
        type: "link",
      },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Beginner Resources</h1>

      <div className="space-y-6">
        {resources.map((res) => (
          <div
            key={res.id}
            className="p-4 bg-white rounded-lg shadow-sm border"
          >
            <h2 className="font-semibold mb-2">{res.title}</h2>
            {res.type === "youtube" ? (
              <div className="aspect-video">
                <iframe
                  src={res.url}
                  title={res.title}
                  className="w-full h-full rounded-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open Resource →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
