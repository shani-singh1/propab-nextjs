"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Users, Loader } from "lucide-react"
import { toast } from "react-hot-toast"

export function ConnectOnFly({ userId, isAutopilotEnabled }) {
  const [matches, setMatches] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [connectionStats, setConnectionStats] = useState({
    totalConnections: 0,
    pendingRequests: 0,
    compatibilityScore: 0
  })

  useEffect(() => {
    fetchConnectionStats()
  }, [])

  const fetchConnectionStats = async () => {
    try {
      const response = await fetch('/api/connections/stats')
      const data = await response.json()
      setConnectionStats(data)
    } catch (error) {
      console.error('Error fetching connection stats:', error)
    }
  }

  const findMatches = async () => {
    setIsSearching(true)
    try {
      const response = await fetch('/api/connections/match', {
        method: 'POST'
      })
      const data = await response.json()
      setMatches(data.matches)
      
      if (data.matches.length > 0) {
        toast.success(`Found ${data.matches.length} potential connections!`)
      } else {
        toast('No new matches found at the moment', {
          icon: 'ℹ️'
        })
      }
    } catch (error) {
      console.error('Error finding matches:', error)
      toast.error('Failed to find matches')
    } finally {
      setIsSearching(false)
    }
  }

  const sendConnectionRequest = async (matchId) => {
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId: matchId })
      })

      if (!response.ok) throw new Error('Failed to send request')

      toast.success('Connection request sent!')
      setMatches(matches.filter(match => match.id !== matchId))
      await fetchConnectionStats()
    } catch (error) {
      console.error('Error sending connection request:', error)
      toast.error('Failed to send connection request')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Connect on Fly</h3>
          </div>
          <Button
            size="sm"
            onClick={findMatches}
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Users className="w-4 h-4 mr-2" />
            )}
            Find Matches
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{connectionStats.totalConnections}</p>
              <p className="text-sm text-muted-foreground">Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{connectionStats.pendingRequests}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{connectionStats.compatibilityScore}%</p>
              <p className="text-sm text-muted-foreground">Compatibility</p>
            </div>
          </div>

          {matches.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Potential Matches</h4>
              {matches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    {match.image && (
                      <img
                        src={match.image}
                        alt={match.name}
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{match.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {match.compatibilityScore}% Match
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => sendConnectionRequest(match.id)}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          )}

          {isAutopilotEnabled && (
            <p className="text-sm text-muted-foreground mt-4">
              Autopilot is enabled. Your digital twin will automatically find and connect with compatible matches.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 