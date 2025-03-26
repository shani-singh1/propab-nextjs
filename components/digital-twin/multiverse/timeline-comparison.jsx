"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  GitBranch,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { TimelineCard } from "./timeline-card"
import { TimelineComparisonDetails } from "./timeline-comparison-details"

export function TimelineComparison({ timeline }) {
  const [expandedCategories, setExpandedCategories] = useState([])

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const compareWithBaseline = (prediction) => {
    // This would be replaced with actual baseline data
    const baseline = {
      shortTerm: "Continue current path",
      longTerm: "Gradual progression",
      relationships: "Maintain current connections",
      personalGrowth: "Natural development",
      careerPath: "Expected trajectory"
    }

    const impact = calculateImpact(prediction, baseline[prediction.category])
    return {
      baseline: baseline[prediction.category],
      impact,
      icon: getImpactIcon(impact)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Timeline Comparison</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(timeline.predictions).map(([category, prediction]) => {
            const isExpanded = expandedCategories.includes(category)
            const comparison = compareWithBaseline({ category, prediction })

            return (
              <motion.div
                key={category}
                className="border rounded-lg overflow-hidden"
                animate={{ height: isExpanded ? "auto" : "64px" }}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-accent"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitBranch className="h-4 w-4" />
                      <h3 className="font-medium capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <comparison.icon className="h-4 w-4" />
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Baseline Path</h4>
                        <p className="text-sm text-muted-foreground">
                          {comparison.baseline}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Alternative Path</h4>
                        <p className="text-sm text-muted-foreground">
                          {prediction}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Key Differences</h4>
                      <div className="space-y-2">
                        {generateKeyDifferences(prediction, comparison.baseline).map((diff, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            {diff}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
          <TimelineComparisonDetails
            timeline={timeline}
            baseTimeline={{
              name: "Current Path",
              description: "Continuing without changes",
              predictions: {
                shortTerm: "Maintain current trajectory",
                longTerm: "Natural progression",
                relationships: "Existing dynamics",
                personalGrowth: "Gradual development",
                careerPath: "Expected advancement"
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function calculateImpact(prediction, baseline) {
  // This would be replaced with more sophisticated impact calculation
  const positiveKeywords = ['improve', 'grow', 'increase', 'better', 'advance']
  const negativeKeywords = ['decrease', 'reduce', 'worsen', 'decline', 'limit']

  const predictionLower = prediction.toLowerCase()
  const positiveCount = positiveKeywords.filter(word => predictionLower.includes(word)).length
  const negativeCount = negativeKeywords.filter(word => predictionLower.includes(word)).length

  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

function getImpactIcon(impact) {
  switch (impact) {
    case 'positive':
      return TrendingUp
    case 'negative':
      return TrendingDown
    default:
      return Minus
  }
}

function generateKeyDifferences(prediction, baseline) {
  // This would be replaced with AI-powered difference analysis
  return [
    "Different approach to challenges",
    "Alternative outcome trajectory",
    "Varied impact on relationships",
    "Modified personal development path"
  ]
} 