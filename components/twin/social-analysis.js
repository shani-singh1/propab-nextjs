"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useTheme } from "next-themes"
import { toast } from "@/components/ui/use-toast"

export function SocialAnalysis({ connection }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch(`/api/social/analyze/${connection.platform}`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      // Refresh the page to show new analysis
      window.location.reload()
    } catch (error) {
      console.error('Error analyzing social data:', error)
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your social data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!connection.analysis) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Run analysis to get insights from your {connection.platform} data
        </p>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing && <LoadingSpinner className="mr-2 h-4 w-4" />}
          Analyze Data
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-3">
        <Card className="p-4">
          <div className="text-sm font-medium">Sentiment Score</div>
          <div className="text-2xl font-bold">
            {Math.round(connection.analysis.sentiment * 100)}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium">Top Topic</div>
          <div className="text-2xl font-bold">
            {Object.keys(connection.analysis.topics)[0]}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium">Engagement</div>
          <div className="text-2xl font-bold">
            {connection.analysis.engagement.average}
          </div>
        </Card>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={Object.entries(connection.analysis.topics)
            .map(([topic, value]) => ({ topic, value }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="topic" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 