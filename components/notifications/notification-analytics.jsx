"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartBar, Clock, Bell } from "lucide-react"

export function NotificationAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/notifications/analytics")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      toast.error("Failed to load notification analytics")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Notification Analytics</h3>
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
      <CardHeader>
        <div className="flex items-center space-x-2">
          <ChartBar className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Notification Analytics</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted">
              <Bell className="h-5 w-5 mb-2" />
              <p className="text-2xl font-bold">{analytics.totalNotifications}</p>
              <p className="text-sm text-muted-foreground">Total Notifications</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <Clock className="h-5 w-5 mb-2" />
              <p className="text-2xl font-bold">{analytics.averagePerDay}</p>
              <p className="text-sm text-muted-foreground">Daily Average</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <Bell className="h-5 w-5 mb-2" />
              <p className="text-2xl font-bold">{analytics.readRate}%</p>
              <p className="text-sm text-muted-foreground">Read Rate</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Notifications by Category</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.byCategory}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Recent Activity</h4>
            <div className="space-y-2">
              {analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <activity.icon className="h-4 w-4" />
                    <span className="text-sm">{activity.description}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 