"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import {
  Brain,
  Users,
  Settings,
  Power,
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react"
import { AutopilotSettings } from "./autopilot-settings"
import { pusherClient } from "@/lib/pusher"
import { trackAction } from "@/lib/utils/track-action"

export function AutopilotMode({ userId, onDeactivate }) {
  const [status, setStatus] = useState("idle") // idle, analyzing, connecting
  const [settings, setSettings] = useState({
    maxConnections: 5,
    minCompatibility: 0.7,
    autoMessage: true,
    focusAreas: ["skills", "interests", "goals"]
  })
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadAutopilotStats()
    
    // Subscribe to real-time updates
    const channel = pusherClient.subscribe(`autopilot-${userId}`)
    
    channel.bind("progress", (data) => {
      setProgress(data.progress)
    })

    channel.bind("activity", (data) => {
      setStats(prev => ({
        ...prev,
        recentActivity: [
          {
            type: data.type,
            message: data.message,
            timestamp: data.timestamp
          },
          ...(prev?.recentActivity || []).slice(0, 9)
        ]
      }))
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [userId])

  const loadAutopilotStats = async () => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}/autopilot/stats`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to load autopilot stats:", error)
    }
  }

  const startAutopilot = async () => {
    setStatus("analyzing")
    setProgress(0)

    try {
      const response = await fetch(`/api/digital-twin/${userId}/autopilot/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error()
      
      // Track autopilot start for gamification
      await trackAction(userId, "AUTOPILOT_START", {
        settings,
        maxConnections: settings.maxConnections
      })

      toast.success("Autopilot started successfully")
    } catch (error) {
      toast.error("Failed to start autopilot")
      setStatus("idle")
    }
  }

  useEffect(() => {
    if (progress === 100) {
      // Track autopilot completion for gamification
      trackAction(userId, "AUTOPILOT_COMPLETE", {
        connectionsCount: stats?.connectionsCount || 0,
        avgCompatibility: stats?.avgCompatibility || 0
      })
    }
  }, [progress])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <AutopilotCard
          title="Connections Made"
          value={stats?.connectionsCount || 0}
          icon={Users}
          trend={stats?.connectionsTrend}
        />
        <AutopilotCard
          title="Average Compatibility"
          value={`${Math.round((stats?.avgCompatibility || 0) * 100)}%`}
          icon={Brain}
          trend={stats?.compatibilityTrend}
        />
        <AutopilotCard
          title="Response Rate"
          value={`${Math.round((stats?.responseRate || 0) * 100)}%`}
          icon={Activity}
          trend={stats?.responseTrend}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant={status === "idle" ? "outline" : "default"}
                onClick={status === "idle" ? startAutopilot : undefined}
                disabled={status !== "idle"}
              >
                <Power className="h-4 w-4 mr-2" />
                {status === "idle" ? "Start Autopilot" : "Running..."}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={onDeactivate}
            >
              Exit Autopilot Mode
            </Button>
          </div>

          {status !== "idle" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{getStatusMessage(status, progress)}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-medium mb-3">Recent Activity</h4>
            <div className="space-y-3">
              {(stats?.recentActivity || []).map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <AutopilotSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  )
}

function AutopilotCard({ title, value, icon: Icon, trend }) {
  const getTrendColor = (trend) => {
    if (trend > 0) return "text-green-500"
    if (trend < 0) return "text-red-500"
    return "text-blue-500"
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-semibold">{value}</span>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor(trend)}`}>
              {trend > 0 ? "+" : ""}
              {trend}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }) {
  const getIcon = (type) => {
    switch (type) {
      case "connection":
        return CheckCircle
      case "pending":
        return Clock
      case "warning":
        return AlertTriangle
      default:
        return Activity
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case "connection":
        return "text-green-500"
      case "pending":
        return "text-yellow-500"
      case "warning":
        return "text-red-500"
      default:
        return "text-blue-500"
    }
  }

  const Icon = getIcon(activity.type)

  return (
    <div className="flex items-start gap-3">
      <Icon className={`h-4 w-4 mt-1 ${getIconColor(activity.type)}`} />
      <div>
        <p className="text-sm">{activity.message}</p>
        <span className="text-xs text-muted-foreground">
          {formatTimestamp(activity.timestamp)}
        </span>
      </div>
    </div>
  )
}

function getStatusMessage(status, progress) {
  switch (status) {
    case "analyzing":
      if (progress < 30) return "Analyzing potential connections..."
      if (progress < 60) return "Evaluating compatibility..."
      return "Preparing connection requests..."
    case "connecting":
      return "Sending connection requests..."
    default:
      return "Ready to start"
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString()
} 