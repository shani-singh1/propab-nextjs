"use client"

import { Card } from "@/components/ui/card"
import { PersonalityChart } from "@/components/profile/personality-chart"

export function TwinInsights({ personality, interests }) {
  if (!personality || !interests) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Complete your personality assessment to see insights.
        </p>
      </div>
    )
  }

  const dominantTraits = Object.entries(personality)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([trait]) => trait)

  const personalityType = dominantTraits.join("-")
  const insightText = getPersonalityInsight(personalityType)

  return (
    <div className="space-y-6">
      <PersonalityChart traits={personality} />
      
      <div className="prose dark:prose-invert">
        <h3>Your Personality Type: {personalityType}</h3>
        <p>{insightText}</p>
        
        <h4>Key Interests</h4>
        <div className="flex flex-wrap gap-2">
          {interests.map(interest => (
            <span
              key={interest}
              className="px-2 py-1 bg-primary/10 rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function getPersonalityInsight(type) {
  // Add personality insights based on dominant traits
  const insights = {
    "Openness-Extraversion": "You're naturally curious and socially engaged...",
    "Conscientiousness-Agreeableness": "You're organized and cooperative...",
    // Add more combinations
  }

  return insights[type] || "Your unique combination of traits makes you adaptable and balanced."
} 