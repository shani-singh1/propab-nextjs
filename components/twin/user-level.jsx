"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Gift } from "lucide-react"

export function UserLevel({ userId }) {
  const [levelData, setLevelData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadLevelData()
  }, [userId])

  const loadLevelData = async () => {
    try {
      const response = await fetch(`/api/gamification/level/${userId}`)
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setLevelData(data)
    } catch (error) {
      toast.error("Failed to load level data")
    } finally {
      setIsLoading(false)
    }
  }

  const claimReward = async (rewardId) => {
    try {
      const response = await fetch(`/api/gamification/rewards/${rewardId}/claim`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error()
      
      toast.success("Reward claimed successfully!")
      loadLevelData() // Refresh data
    } catch (error) {
      toast.error("Failed to claim reward")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Level Progress</h3>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Level {levelData.currentLevel}</h3>
          </div>
          <Badge variant="secondary">
            {levelData.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP: {levelData.currentXP}</span>
              <span>{levelData.nextLevelXP} XP needed</span>
            </div>
            <Progress 
              value={(levelData.currentXP / levelData.nextLevelXP) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Available Rewards
            </h4>
            <div className="grid gap-4">
              {levelData.rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div>
                    <p className="font-medium">{reward.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {reward.description}
                    </p>
                  </div>
                  <button
                    onClick={() => claimReward(reward.id)}
                    disabled={!reward.canClaim}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      reward.canClaim
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {reward.canClaim ? 'Claim' : 'Locked'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 