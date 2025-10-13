"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const paths = [
  {
    id: 1,
    title: "UI/UX Design",
    color: "from-pink-300 to-pink-500",
    description:
      "Learn the art of creating beautiful, user-friendly interfaces using design thinking and Figma.",
    topics: ["Design Principles", "Wireframing", "Prototyping", "Figma"],
  },
  {
    id: 2,
    title: "Frontend Development",
    color: "from-blue-300 to-blue-500",
    description:
      "Build interactive websites using HTML, CSS, JavaScript, and React.",
    topics: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    id: 3,
    title: "Backend Development",
    color: "from-emerald-300 to-emerald-500",
    description:
      "Learn how servers, APIs, and databases work using Node.js and Firebase.",
    topics: ["Node.js", "APIs", "Databases", "Firebase"],
  },
  {
    id: 4,
    title: "AI & Machine Learning",
    color: "from-indigo-300 to-indigo-500",
    description:
      "Understand how AI works, from Python basics to simple ML models.",
    topics: ["Python", "Data Science", "TensorFlow", "AI Models"],
  },
];

// Tools/Skills Section
const tools = [
  {
    id: 1,
    name: "Git & GitHub",
    color: "from-gray-300 to-gray-500",
    description:
      "Version control your projects, collaborate, and manage code using Git and GitHub.",
  },
  {
    id: 3,
    name: "VS Code",
    color: "from-blue-200 to-blue-400",
    description:
      "Boost productivity with Visual Studio Code, extensions, and developer tooling.",
  },
  {
    id: 4,
    name: "Vercel",
    color: "from-purple-300 to-purple-500",
    description:
      "Deploy your projects seamlessly with Vercel for fast, reliable hosting.",
  },
];

export default function LearningPathPage() {
  return (
    <main className="min-h-screen bg-white py-20 px-6 sm:px-12 lg:px-20">
      <section className="max-w-6xl mx-auto space-y-16 text-center">
        {/* Header */}
        <div>
          <h1 className="text-5xl font-extrabold text-[#004d40] drop-shadow-md">
            Your Learning Path 
          </h1>
          <p className="text-gray-700 mt-4 text-lg max-w-2xl mx-auto">
            Choose your path and start learning step by step. Whether you love
            design, coding, or AI — we’ll guide you all the way.
          </p>
        </div>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {paths.map((path) => (
            <div key={path.id}>
              <Card className="h-full shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-md border-none">
                <div
                  className={`h-2 rounded-t-2xl bg-gradient-to-r ${path.color}`}
                />
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-[#004d40]">
                    {path.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{path.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {path.topics.map((topic, i) => (
                      <Badge key={i} className="bg-[#00796b] text-white">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        {/* Tools/Skills Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-[#004d40] mt-12 mb-2">Essential Tools &amp; Skills</h2>
          <p className="text-gray-700 mb-4 max-w-xl mx-auto">
            Master these tools to supercharge your workflow, collaborate effectively, and build projects like a pro.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {tools.map((tool) => (
              <div key={tool.id}>
                <Card className="h-full shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-md border-none">
                  <div
                    className={`h-2 rounded-t-2xl bg-gradient-to-r ${tool.color}`}
                  />
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-[#004d40]">
                      {tool.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{tool.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
