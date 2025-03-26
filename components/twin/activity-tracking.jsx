"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Calendar, Activity, TrendingUp } from "lucide-react"

export function ActivityTracking({ userId }) {
  const [activityData, setActivityData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadActivityData()
  }, [userId])

  const loadActivityData = async () => {
    try {
      const response = await fetch(`/api/analysis/activity/${userId}`)
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setActivityData(data)
    } catch (error) {
      toast.error("Failed to load activity data")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Activity Analysis</h3>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Activity Analysis</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={loadActivityData}
        >
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData.timeline}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="posts" 
                  stroke="#8884d8" 
                  name="Posts"
                />
                <Line 
                  type="monotone" 
                  dataKey="interactions" 
                  stroke="#82ca9d" 
                  name="Interactions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {activityData.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Activity Insights</h4>
            <ul className="space-y-1">
              {activityData.insights.map((insight, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 