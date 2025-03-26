"use client"

import { Brain, Users, Lightbulb, Target } from "lucide-react"

export function TwinInsights({ profile }) {
  const insights = generateInsights(profile)

  return (
    <div className="space-y-6">
      {insights.map((insight, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <insight.icon className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">{insight.title}</h4>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function generateInsights(profile) {
  const { traits, user } = profile
  const dominantTraits = Object.entries(traits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([trait]) => trait)

  return [
    {
      icon: Brain,
      title: "Personality Core",
      description: `Your digital twin shows strong ${dominantTraits.join(" and ")} tendencies, making you naturally skilled in these areas.`
    },
    {
      icon: Users,
      title: "Social Dynamics",
      description: `With ${user._count.followers} followers and following ${user._count.following} people, you maintain a balanced social network.`
    },
    {
      icon: Lightbulb,
      title: "Content Creation",
      description: `You've shared ${user._count.posts} posts, contributing actively to the community.`
    },
    {
      icon: Target,
      title: "Growth Opportunities",
      description: "Based on your profile, consider exploring leadership and creative activities to enhance your digital presence."
    }
  ]
} 