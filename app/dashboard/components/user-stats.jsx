"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  MessageSquare, 
  UserCheck, 
  Activity as ActivityIcon,
  Loader2 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDashboardSocket } from "@/hooks/use-dashboard-socket"

export function UserStats({ userId }) {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useDashboardSocket({
    onStatsUpdate: (newStats) => {
      setStats(prev => ({ ...prev, ...newStats }))
    }
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/user/stats")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast.error("Failed to load user stats")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Your Stats</h3>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Twin Connections</span>
              </div>
              <span className="text-2xl font-bold">{stats.twinCount}</span>
            </div>
            <Progress value={(stats.twinCount / 10) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">Messages</span>
              </div>
              <span className="text-2xl font-bold">{stats.messageCount}</span>
            </div>
            <Progress 
              value={Math.min((stats.messageCount / 100) * 100, 100)} 
              className="h-2" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Profile Completion</span>
              </div>
              <span className="text-2xl font-bold">{stats.profileScore}%</span>
            </div>
            <Progress value={stats.profileScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Match Quality</span>
              </div>
              <span className="text-2xl font-bold">{stats.matchQuality}%</span>
            </div>
            <Progress value={stats.matchQuality} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 