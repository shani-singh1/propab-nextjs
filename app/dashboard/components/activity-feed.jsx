"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Activity, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

const ACTIVITY_ICONS = {
  TWIN_REQUEST: "👥",
  TWIN_ACCEPT: "🤝",
  MESSAGE: "💬",
  PERSONALITY_UPDATE: "🧠",
  SOCIAL_CONNECT: "🔗"
}

export function ActivityFeed({ userId }) {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      const response = await fetch("/api/activity")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setActivities(data)
    } catch (error) {
      toast.error("Failed to load activity feed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg border"
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-lg">
                  {ACTIVITY_ICONS[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true
                      })}
                    </span>
                  </div>
                  {activity.relatedUser && (
                    <div className="mt-2 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={activity.relatedUser.image}
                          alt={activity.relatedUser.name}
                        />
                        <AvatarFallback>
                          {activity.relatedUser.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {activity.relatedUser.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 