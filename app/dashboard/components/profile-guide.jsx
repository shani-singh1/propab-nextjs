"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const COMPLETION_STEPS = [
  {
    id: "personality",
    title: "Complete Personality Assessment",
    description: "Answer questions about your personality traits",
    link: "/onboarding?step=personality"
  },
  {
    id: "interests",
    title: "Add Your Interests",
    description: "Share your hobbies and interests",
    link: "/onboarding?step=interests"
  },
  {
    id: "social",
    title: "Connect Social Accounts",
    description: "Link your social media accounts for better matching",
    link: "/onboarding?step=social"
  },
  {
    id: "photo",
    title: "Add Profile Photo",
    description: "Upload a clear profile photo",
    link: "/settings/profile"
  }
]

export function ProfileGuide({ completedSteps }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const completionPercentage = 
    (Object.values(completedSteps).filter(Boolean).length / COMPLETION_STEPS.length) * 100

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Profile Completion Guide</h3>
            <div className="flex items-center gap-2">
              <Progress value={completionPercentage} className="w-[100px] h-2" />
              <span className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}% Complete
              </span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {COMPLETION_STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg transition-colors",
                  completedSteps[step.id]
                    ? "bg-muted"
                    : "border"
                )}
              >
                {completedSteps[step.id] ? (
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{step.title}</p>
                    {!completedSteps[step.id] && (
                      <Button variant="link" asChild>
                        <a href={step.link}>Complete</a>
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
} 