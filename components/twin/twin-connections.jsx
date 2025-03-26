"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Users2, MessageCircle, UserMinus } from "lucide-react"
import Link from "next/link"

export function TwinConnections() {
  const [connections, setConnections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    try {
      const response = await fetch("/api/twins/connections")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setConnections(data)
    } catch (error) {
      toast.error("Failed to load connections")
    } finally {
      setIsLoading(false)
    }
  }

  const removeConnection = async (connectionId) => {
    try {
      const response = await fetch(`/api/twins/connect/${connectionId}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error()

      setConnections(prev => prev.filter(conn => conn.id !== connectionId))
      toast.success("Connection removed")
    } catch (error) {
      toast.error("Failed to remove connection")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users2 className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Your Twins</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
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

  if (connections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users2 className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Your Twins</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No connections yet. Start connecting with your digital twins!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users2 className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Your Twins</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {connections.length} connection{connections.length !== 1 && "s"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connections.map((connection) => {
            const twin = connection.userId === connection.user.id
              ? connection.twin
              : connection.user

            return (
              <div
                key={connection.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={twin.image} alt={twin.name} />
                  <AvatarFallback>
                    {twin.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{twin.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {connection.matchScore}% Match
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <Link href={`/chat/${twin.id}`}>
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeConnection(connection.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 