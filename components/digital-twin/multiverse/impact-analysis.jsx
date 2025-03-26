"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import {
  Compass,
  Target,
  Lightbulb,
  Heart,
  Briefcase,
  Brain,
  TrendingUp
} from "lucide-react"

const IMPACT_CATEGORIES = [
  {
    id: "personal",
    name: "Personal Growth",
    icon: Brain,
    description: "Impact on individual development and character"
  },
  {
    id: "social",
    name: "Social Dynamics",
    icon: Heart,
    description: "Effects on relationships and social connections"
  },
  {
    id: "career",
    name: "Professional Path",
    icon: Briefcase,
    description: "Career trajectory and work-life implications"
  },
  {
    id: "opportunities",
    name: "New Opportunities",
    icon: Lightbulb,
    description: "Potential doors opened by this path"
  },
  {
    id: "goals",
    name: "Goal Achievement",
    icon: Target,
    description: "Alignment with personal objectives"
  }
]

export function ImpactAnalysis({ timeline }) {
  const [selectedCategory, setSelectedCategory] = useState(null)

  const getImpactScore = (category) => {
    // This would be replaced with actual impact calculations
    const baseScore = timeline.impact * 100
    const categoryMultipliers = {
      personal: 1.2,
      social: 0.9,
      career: 1.1,
      opportunities: 1.0,
      goals: 0.8
    }
    return Math.min(100, baseScore * (categoryMultipliers[category.id] || 1))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Impact Analysis</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            {IMPACT_CATEGORIES.map((category) => {
              const score = getImpactScore(category)
              const Icon = category.icon

              return (
                <div
                  key={category.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCategory?.id === category.id
                      ? "border-primary bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-start gap-4">
                    <Icon className="h-5 w-5 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{category.name}</h3>
                        <span className="text-sm">
                          {Math.round(score)}% Impact
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border rounded-lg p-6">
            {selectedCategory ? (
              <motion.div
                key={selectedCategory.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <selectedCategory.icon className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">
                    {selectedCategory.name} Impact
                  </h3>
                </div>

                <div className="space-y-4">
                  <ImpactDetail
                    title="Key Changes"
                    items={generateImpactDetails(selectedCategory, timeline)}
                  />
                  <ImpactDetail
                    title="Growth Opportunities"
                    items={generateGrowthOpportunities(selectedCategory)}
                  />
                  <ImpactDetail
                    title="Potential Challenges"
                    items={generateChallenges(selectedCategory)}
                  />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {generateRecommendations(selectedCategory).map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <TrendingUp className="h-4 w-4" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a category to see detailed analysis
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ImpactDetail({ title, items }) {
  return (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <div className="w-1 h-1 rounded-full bg-primary" />
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function generateImpactDetails(category, timeline) {
  // This would be replaced with AI-generated impact analysis
  return [
    "Significant shift in trajectory",
    "New perspectives gained",
    "Modified approach to challenges",
    "Enhanced understanding"
  ]
}

function generateGrowthOpportunities(category) {
  // This would be replaced with AI-generated opportunities
  return [
    "Skill development potential",
    "Network expansion",
    "Knowledge acquisition",
    "Experience building"
  ]
}

function generateChallenges(category) {
  // This would be replaced with AI-generated challenges
  return [
    "Initial adaptation period",
    "Resource requirements",
    "Learning curve",
    "Uncertainty management"
  ]
}

function generateRecommendations(category) {
  // This would be replaced with AI-generated recommendations
  return [
    "Focus on key strengths",
    "Develop support systems",
    "Set milestone goals",
    "Monitor progress regularly"
  ]
} 