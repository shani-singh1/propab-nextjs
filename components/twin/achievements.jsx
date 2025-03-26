"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, Users, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const ACHIEVEMENT_ICONS = {
  INFLUENCER: Users,
  CREATOR: Star,
  ENGAGER: Zap,
  CONSISTENT: Target,
  POPULAR: Trophy
}

export function Achievements({ userId }) {
  const [achievements, setAchievements] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAchievements()
  }, [userId])

  const loadAchievements = async () => {
    try {
      const response = await fetch(`/api/gamification/achievements/${userId}`)
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setAchievements(data)
    } catch (error) {
      toast.error("Failed to load achievements")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Achievements</h3>
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
          <h3 className="text-lg font-semibold">Achievements</h3>
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-bold">{achievements.totalPoints} Points</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {achievements.items.map((achievement) => {
            const Icon = ACHIEVEMENT_ICONS[achievement.type]
            return (
              <div key={achievement.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${achievement.completed ? 'bg-primary' : 'bg-muted'}`}>
                      <Icon className={`h-4 w-4 ${achievement.completed ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {achievement.progress}/{achievement.target}
                  </span>
                </div>
                <Progress value={(achievement.progress / achievement.target) * 100} />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 