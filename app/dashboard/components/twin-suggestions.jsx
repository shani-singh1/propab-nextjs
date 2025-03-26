"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Users, Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TwinSuggestions({ userId }) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      const response = await fetch("/api/twins/match")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      toast.error("Failed to load twin suggestions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (twinId) => {
    try {
      const response = await fetch("/api/twins/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twinId })
      })

      if (!response.ok) throw new Error()
      
      setSuggestions(prev =>
        prev.map(s =>
          s.user.id === twinId ? { ...s, status: "PENDING" } : s
        )
      )
      toast.success("Connection request sent!")
    } catch (error) {
      toast.error("Failed to send connection request")
    }
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
            {suggestions.length} matches
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No potential twins found yet. Keep updating your profile!
            </p>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.user.id}
                className="flex items-start gap-4 p-4 rounded-lg border"
              >
                <Avatar>
                  <AvatarImage
                    src={suggestion.user.image}
                    alt={suggestion.user.name}
                  />
                  <AvatarFallback>
                    {suggestion.user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{suggestion.user.name}</h4>
                    <span className="text-sm font-medium">
                      {suggestion.score}% Match
                    </span>
                  </div>
                  <Progress value={suggestion.score} className="h-2" />
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(suggestion.breakdown).map(([key, value]) => (
                      <div
                        key={key}
                        className="text-xs px-2 py-1 rounded-full bg-muted"
                      >
                        {key}: {value}%
                      </div>
                    ))}
                  </div>
                </div>
                {suggestion.status === "PENDING" ? (
                  <Button variant="outline" disabled>
                    Pending
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(suggestion.user.id)}
                  >
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