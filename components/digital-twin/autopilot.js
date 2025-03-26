"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Pause, Play } from "lucide-react"
import toast from "react-hot-toast"

export function Autopilot({ userId }) {
  const [isActive, setIsActive] = useState(false)
  const [currentActivity, setCurrentActivity] = useState(null)

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(checkActivity, 5000)
      return () => clearInterval(interval)
    }
  }, [isActive])

  const checkActivity = async () => {
    try {
      const response = await fetch('/api/autopilot/status')
      const data = await response.json()
      setCurrentActivity(data.currentActivity)
    } catch (error) {
      console.error('Error checking autopilot status:', error)
    }
  }

  const toggleAutopilot = async () => {
    try {
      const response = await fetch('/api/autopilot/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !isActive })
      })

      if (!response.ok) throw new Error('Failed to toggle autopilot')

      setIsActive(!isActive)
      toast.success(isActive ? 'Autopilot deactivated' : 'Autopilot activated')
    } catch (error) {
      console.error('Error toggling autopilot:', error)
      toast.error('Failed to toggle autopilot')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4" />
          <h3 className="font-semibold">Autopilot</h3>
        </div>
        <Button
          variant={isActive ? "destructive" : "default"}
          size="sm"
          onClick={toggleAutopilot}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isActive 
              ? "Your digital twin is actively engaging with the community"
              : "Activate autopilot to let your digital twin interact autonomously"
            }
          </p>
          {currentActivity && (
            <p className="text-sm font-medium">
              Current activity: {currentActivity}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 