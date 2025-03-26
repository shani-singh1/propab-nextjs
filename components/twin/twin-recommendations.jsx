"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Users, ArrowRight } from "lucide-react"

export function TwinRecommendations({ profile }) {
  const [recommendations, setRecommendations] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadRecommendations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analysis/recommendations")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setRecommendations(data)
    } catch (error) {
      toast.error("Failed to load recommendations")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Recommended Connections</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={loadRecommendations}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {recommendations ? (
          <div className="space-y-4">
            {recommendations.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.image || `https://avatar.vercel.sh/${user.id}`}
                    alt={user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.matchScore}% match
                    </p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/profile/${user.id}`}>
                    View Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Click refresh to see recommended connections based on your digital twin.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 