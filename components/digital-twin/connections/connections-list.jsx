"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Search, Filter, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ConnectionCard } from "./connection-card"
import { useToast } from "@/hooks/use-toast"
import { pusherClient } from "@/lib/pusher"

export function ConnectionsList({ userId }) {
  const [connections, setConnections] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, active, pending
  const { toast } = useToast()

  useEffect(() => {
    loadConnections()

    // Set up real-time updates
    const channel = pusherClient.subscribe(`user-${userId}`)
    channel.bind("connection_update", handleConnectionUpdate)
    channel.bind("new_connection", handleNewConnection)

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [userId, filter])

  const loadConnections = async () => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}/connections?filter=${filter}`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setConnections(data)
    } catch (error) {
      console.error("Error loading connections:", error)
      toast.error("Failed to load connections")
    } finally {
      setLoading(false)
    }
  }

  const handleConnectionUpdate = (data) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === data.id ? { ...conn, ...data } : conn
      )
    )
  }

  const handleNewConnection = (data) => {
    setConnections(prev => [data, ...prev])
  }

  const filteredConnections = connections.filter(connection => {
    const searchTerm = searchQuery.toLowerCase()
    return (
      connection.twin.name.toLowerCase().includes(searchTerm) ||
      connection.twin.personalityProfile?.interests.some(interest => 
        interest.toLowerCase().includes(searchTerm)
      )
    )
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Your Connections</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <AnimatePresence mode="popLayout">
            {filteredConnections.length > 0 ? (
              <div className="space-y-4">
                {filteredConnections.map((connection, index) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ConnectionCard
                      connection={connection}
                      userId={userId}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No connections found
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 