"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function PersonalityInsights({ userId }) {
  const [insights, setInsights] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      const response = await fetch("/api/personality/insights")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      toast.error("Failed to load personality insights")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Your Personality Profile</h3>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Your Personality Profile</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {insights.map((insight) => (
            <div key={insight.trait} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium capitalize">{insight.trait}</h4>
                <span className="text-sm text-muted-foreground capitalize">
                  {insight.level}
                </span>
              </div>
              <Progress
                value={
                  insight.level === "high"
                    ? 80
                    : insight.level === "moderate"
                    ? 50
                    : 20
                }
                className="h-2"
              />
              <p className="text-sm text-muted-foreground">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 