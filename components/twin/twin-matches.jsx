"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Users, UserPlus, Check, X } from "lucide-react"

export function TwinMatches() {
  const [matches, setMatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      const response = await fetch("/api/twins/match")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setMatches(data)
    } catch (error) {
      toast.error("Failed to load matches")
    } finally {
      setIsLoading(false)
    }
  }

  const sendConnectionRequest = async (twinId) => {
    try {
      const response = await fetch("/api/twins/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twinId })
      })

      if (!response.ok) throw new Error()
      
      // Update UI to show pending status
      setMatches(prev =>
        prev.map(match =>
          match.user.id === twinId
            ? { ...match, status: "PENDING" }
            : match
        )
      )

      toast.success("Connection request sent!")
    } catch (error) {
      toast.error("Failed to send connection request")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Potential Twins</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Potential Twins</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {matches.length} matches found
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {matches.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No potential twins found yet. Keep updating your profile!
            </p>
          ) : (
            matches.map((match) => (
              <div
                key={match.user.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={match.user.image} alt={match.user.name} />
                  <AvatarFallback>
                    {match.user.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{match.user.name}</h4>
                    <span className="text-sm font-medium">
                      {match.score}% Match
                    </span>
                  </div>
                  <Progress value={match.score} className="h-2" />
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(match.breakdown).map(([key, value]) => (
                      <div
                        key={key}
                        className="text-xs px-2 py-1 rounded-full bg-muted"
                      >
                        {key}: {value}%
                      </div>
                    ))}
                  </div>
                </div>
                {match.status === "PENDING" ? (
                  <Button variant="outline" disabled>
                    <Check className="h-4 w-4 mr-2" />
                    Pending
                  </Button>
                ) : (
                  <Button onClick={() => sendConnectionRequest(match.user.id)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 