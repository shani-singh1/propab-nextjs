"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

export function useWebSocket(onNotification) {
  const wsRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data)
        onNotification(notification)

        // Show toast for new notifications
        toast({
          title: notification.title,
          description: notification.message,
        })
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
    }
  }, [onNotification])

  return wsRef.current
} 