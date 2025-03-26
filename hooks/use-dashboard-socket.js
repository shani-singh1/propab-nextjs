"use client"

import { useEffect } from "react"
import { useWebSocket } from "./use-websocket"

export function useDashboardSocket({ onStatsUpdate, onNewActivity, onNewMatch }) {
  const socket = useWebSocket((data) => {
    switch (data.type) {
      case "STATS_UPDATE":
        onStatsUpdate?.(data.stats)
        break
      case "NEW_ACTIVITY":
        onNewActivity?.(data.activity)
        break
      case "NEW_MATCH":
        onNewMatch?.(data.match)
        break
    }
  })

  useEffect(() => {
    // Subscribe to dashboard updates
    socket?.emit("subscribe:dashboard")

    return () => {
      socket?.emit("unsubscribe:dashboard")
    }
  }, [socket])

  return socket
} 