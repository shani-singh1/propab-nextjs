"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { TimelineGraph } from "./timeline-graph"
import {
  GitBranch,
  Clock,
  ArrowRight,
  X,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { trackAction } from "@/lib/utils/track-action"

export function TimelineVisualizer({ timeline, relatedTimelines, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const steps = [
    { title: "Present", content: "Current situation" },
    ...Object.entries(timeline.predictions).map(([key, value]) => ({
      title: key,
      content: value
    }))
  ]

  const handleStepComplete = async (step) => {
    // Track timeline progress for gamification
    await trackAction(timeline.userId, "TIMELINE_PROGRESS", {
      timelineId: timeline.id,
      step: currentStep,
      totalSteps: steps.length
    })

    if (currentStep === steps.length - 1) {
      // Track timeline completion for gamification
      await trackAction(timeline.userId, "TIMELINE_COMPLETE", {
        timelineId: timeline.id,
        quality: timeline.probability
      })
    }
    
    setCurrentStep(prev => prev + 1)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch className="h-5 w-5" />
            <div>
              <h2 className="text-lg font-semibold">{timeline.name}</h2>
              <p className="text-sm text-muted-foreground">
                {timeline.description}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <TimelineGraph
            timeline={timeline}
            relatedTimelines={relatedTimelines}
          />

          {/* Timeline navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{steps[currentStep].title}</span>
            </div>
            <Button
              variant="ghost"
              disabled={currentStep === steps.length - 1}
              onClick={() => setCurrentStep(prev => prev + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Timeline visualization */}
          <div className="relative">
            <div className="absolute top-0 left-1/2 h-full w-px bg-border" />
            <div className="relative z-10">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: index === currentStep ? 1 : 0.5,
                    y: 0
                  }}
                  className={`flex items-start gap-4 pb-8 ${
                    index === currentStep ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div className="flex-1 text-right">
                    <h3 className="font-medium">{step.title}</h3>
                    {index === 0 && (
                      <div className="text-sm text-muted-foreground">
                        Starting point
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border">
                    {index === currentStep ? (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{step.content}</p>
                    {index === currentStep && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-sm text-muted-foreground"
                      >
                        {getStepInsight(step.title, timeline)}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getStepInsight(step, timeline) {
  switch (step) {
    case "Present":
      return `This is where the timeline diverges. The main variable changed is: ${
        Object.entries(timeline.variables)[0].join(": ")
      }`
    case "shortTerm":
      return "Immediate effects and adaptations in the next few months"
    case "longTerm":
      return "Long-lasting changes and developments over years"
    case "relationships":
      return "How relationships and social dynamics would be affected"
    case "personalGrowth":
      return "Impact on personal development and character"
    case "careerPath":
      return "Professional implications and career trajectory changes"
    default:
      return ""
  }
} 