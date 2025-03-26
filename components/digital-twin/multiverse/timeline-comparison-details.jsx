"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import {
  GitBranch,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  AlertTriangle
} from "lucide-react"

export function TimelineComparisonDetails({ timeline, baseTimeline }) {
  const [selectedAspect, setSelectedAspect] = useState(null)

  const compareAspects = [
    {
      id: "decisions",
      name: "Key Decisions",
      icon: GitBranch,
      analysis: analyzeDecisions(timeline, baseTimeline)
    },
    {
      id: "outcomes",
      name: "Potential Outcomes",
      icon: Sparkles,
      analysis: analyzeOutcomes(timeline, baseTimeline)
    },
    {
      id: "risks",
      name: "Risk Assessment",
      icon: AlertTriangle,
      analysis: analyzeRisks(timeline, baseTimeline)
    }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Detailed Comparison</h3>
          <div className="text-sm text-muted-foreground">
            Comparing with baseline timeline
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {compareAspects.map((aspect) => {
            const Icon = aspect.icon
            return (
              <Card
                key={aspect.id}
                className={`cursor-pointer transition-all ${
                  selectedAspect?.id === aspect.id
                    ? "border-primary bg-accent"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedAspect(aspect)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <h4 className="font-medium">{aspect.name}</h4>
                  </div>
                  <div className="mt-4">
                    <Progress
                      value={aspect.analysis.confidence * 100}
                      className="h-1"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(aspect.analysis.confidence * 100)}% Confidence
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {selectedAspect && (
            <motion.div
              key={selectedAspect.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 space-y-4"
            >
              {selectedAspect.analysis.comparisons.map((comparison, index) => (
                <ComparisonItem
                  key={index}
                  comparison={comparison}
                  baseTimeline={baseTimeline}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

function ComparisonItem({ comparison, baseTimeline }) {
  const getImpactIcon = (impact) => {
    if (impact > 0) return TrendingUp
    if (impact < 0) return TrendingDown
    return ArrowRight
  }

  const Icon = getImpactIcon(comparison.impact)

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      <Icon
        className={`h-5 w-5 mt-1 ${
          comparison.impact > 0
            ? "text-green-500"
            : comparison.impact < 0
            ? "text-red-500"
            : "text-blue-500"
        }`}
      />
      <div className="flex-1">
        <h4 className="font-medium">{comparison.aspect}</h4>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-1">Baseline</div>
            <p className="text-sm text-muted-foreground">
              {comparison.baseline}
            </p>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Alternative</div>
            <p className="text-sm text-muted-foreground">
              {comparison.alternative}
            </p>
          </div>
        </div>
        {comparison.implications && (
          <div className="mt-3">
            <div className="text-sm font-medium mb-1">Key Implications</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {comparison.implications.map((implication, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  {implication}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function analyzeDecisions(timeline, baseTimeline) {
  // This would be replaced with actual analysis logic
  return {
    confidence: 0.85,
    comparisons: [
      {
        aspect: "Initial Choice",
        baseline: "Continue current path",
        alternative: "Take new direction",
        impact: 1,
        implications: [
          "Different skill development focus",
          "New opportunities emerge",
          "Changed relationship dynamics"
        ]
      },
      // Add more comparisons...
    ]
  }
}

function analyzeOutcomes(timeline, baseTimeline) {
  return {
    confidence: 0.75,
    comparisons: [
      {
        aspect: "Career Trajectory",
        baseline: "Gradual progression",
        alternative: "Accelerated growth potential",
        impact: 1,
        implications: [
          "Faster skill acquisition",
          "Increased responsibility",
          "Higher stress levels initially"
        ]
      },
      // Add more comparisons...
    ]
  }
}

function analyzeRisks(timeline, baseTimeline) {
  return {
    confidence: 0.9,
    comparisons: [
      {
        aspect: "Uncertainty Level",
        baseline: "Known environment",
        alternative: "New challenges",
        impact: -0.5,
        implications: [
          "Higher initial uncertainty",
          "Need for quick adaptation",
          "Potential for unexpected outcomes"
        ]
      },
      // Add more comparisons...
    ]
  }
} 