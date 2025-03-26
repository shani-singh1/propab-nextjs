"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { NotificationFilters } from "./notification-filters"
import { useWebSocket } from "@/hooks/use-websocket"
import { formatDistanceToNow } from "date-fns"

export function NotificationList() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const { toast } = useToast()

  useWebSocket((notification) => {
    setNotifications(prev => [notification, ...prev])
  })

  useEffect(() => {
    loadNotifications()
  }, [filters])

  const loadNotifications = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.search) queryParams.append("search", filters.search)
      if (filters.categories?.length) {
        queryParams.append("categories", filters.categories.join(","))
      }
      if (filters.dateRange?.from) {
        queryParams.append("from", filters.dateRange.from.toISOString())
      }
      if (filters.dateRange?.to) {
        queryParams.append("to", filters.dateRange.to.toISOString())
      }

      const response = await fetch(`/api/notifications?${queryParams}`)
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      toast.error("Failed to load notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error()
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
    } catch (error) {
      toast.error("Failed to mark notification as read")
    }
  }

  if (isLoading) {
    return (
      <Card className="w-[380px] p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-[70%]" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <NotificationFilters onFilter={setFilters} />
      <Card className="w-[380px] p-4">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No notifications yet
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                    notification.read ? 'bg-background' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

function getNotificationIcon(type) {
  switch (type) {
    case "ACHIEVEMENT":
      return <Trophy className="h-6 w-6 text-yellow-500" />
    case "LEVEL_UP":
      return <Sparkles className="h-6 w-6 text-purple-500" />
    case "REWARD":
      return <Gift className="h-6 w-6 text-green-500" />
    default:
      return <Bell className="h-6 w-6 text-blue-500" />
  }
} 