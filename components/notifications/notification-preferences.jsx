"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Bell, Users, Trophy, Sparkles, Brain, Mail } from "lucide-react"

const NOTIFICATION_TYPES = [
  {
    id: "social",
    label: "Social Interactions",
    description: "Follows, likes, and comments",
    icon: Users
  },
  {
    id: "achievements",
    label: "Achievements",
    description: "New achievements and rewards",
    icon: Trophy
  },
  {
    id: "level_ups",
    label: "Level Progress",
    description: "Level ups and milestones",
    icon: Sparkles
  },
  {
    id: "insights",
    label: "Twin Insights",
    description: "Personality insights and matches",
    icon: Brain
  },
  {
    id: "emailEnabled",
    label: "Email Notifications",
    description: "Receive notifications via email",
    icon: Mail
  }
]

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setPreferences(data)
    } catch (error) {
      toast.error("Failed to load notification preferences")
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreference = async (type, enabled) => {
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, enabled })
      })

      if (!response.ok) throw new Error()
      
      setPreferences(prev => ({
        ...prev,
        [type]: enabled
      }))

      toast.success("Preferences updated")
    } catch (error) {
      toast.error("Failed to update preferences")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-[200px]" />
                  <div className="h-3 bg-muted animate-pulse rounded w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {NOTIFICATION_TYPES.map(({ id, label, description, icon: Icon }) => (
            <div key={id} className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences[id] ?? true}
                onCheckedChange={(checked) => updatePreference(id, checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 