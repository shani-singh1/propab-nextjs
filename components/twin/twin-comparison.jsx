"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { TwinVisualization } from "./twin-visualization"

export function TwinComparison({ userProfile }) {
  const [comparisonData, setComparisonData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const findSimilarUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analysis/similar-users")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setComparisonData(data)
    } catch (error) {
      toast.error("Failed to find similar users")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Twin Comparison</h3>
          <Button 
            onClick={findSimilarUsers} 
            disabled={isLoading}
          >
            Find Similar Users
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {comparisonData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Your Profile</h4>
                <TwinVisualization traits={userProfile.traits} />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Most Similar User</h4>
                <TwinVisualization traits={comparisonData.traits} />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Similarity Score: {comparisonData.similarity}%</h4>
              <p className="text-sm text-muted-foreground">
                You share similar traits in {comparisonData.commonInterests.join(", ")}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Click the button above to find users with similar personality traits.
          </p>
        )}
      </CardContent>
    </Card>
  )
} 