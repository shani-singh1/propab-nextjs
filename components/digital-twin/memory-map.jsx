"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Star, Trophy, TrendingUp, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const BADGES = {
  MEMORY_MASTER: {
    icon: Brain,
    name: "Memory Master",
    description: "Collected over 100 memories"
  },
  SOCIAL_BUTTERFLY: {
    icon: Star,
    name: "Social Butterfly",
    description: "High interaction rate with memories"
  },
  GROWTH_MINDSET: {
    icon: TrendingUp,
    name: "Growth Mindset",
    description: "Consistent positive learning trend"
  },
  INSIGHT_SAGE: {
    icon: Trophy,
    name: "Insight Sage",
    description: "Generated valuable insights from memories"
  }
}

export function MemoryMap({ userId }) {
  const [memoryData, setMemoryData] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadMemoryData()
  }, [])

  const loadMemoryData = async () => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}/memories`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setMemoryData(data)
    } catch (error) {
      toast.error("Failed to load memory data")
    } finally {
      setIsLoading(false)
    }
  }

  const earnedBadges = calculateEarnedBadges(memoryData?.stats)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Memory Map</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Level {calculateLevel(memoryData?.stats?.learningProgress)}
              </Badge>
              <Progress 
                value={memoryData?.stats?.learningProgress} 
                className="w-24"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-medium">Top Topics</h3>
              {memoryData?.stats?.topTopics.map((topic) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedTopic(topic)}
                >
                  <span>{topic.topic}</span>
                  <Badge>{topic.learningPoints} pts</Badge>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Earned Badges</h3>
              <div className="grid grid-cols-2 gap-2">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.name}
                    className="flex flex-col items-center p-2 border rounded-lg"
                  >
                    <badge.icon className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{selectedTopic.topic}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTopic(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {selectedTopic.summary}
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedTopic.learningPoints}
                      </div>
                      <div className="text-sm text-muted-foreground">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {selectedTopic.interactions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Interactions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {(selectedTopic.growth.rate).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Growth Rate
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function calculateLevel(progress) {
  if (!progress) return 1
  return Math.floor(progress / 10) + 1
}

function calculateEarnedBadges(stats) {
  if (!stats) return []
  
  const badges = []
  
  if (stats.totalMemories >= 100) {
    badges.push(BADGES.MEMORY_MASTER)
  }
  
  if (stats.topTopics.some(t => t.interactions > 50)) {
    badges.push(BADGES.SOCIAL_BUTTERFLY)
  }
  
  if (stats.sentimentTrend > 0.5) {
    badges.push(BADGES.GROWTH_MINDSET)
  }
  
  if (stats.learningProgress > 75) {
    badges.push(BADGES.INSIGHT_SAGE)
  }
  
  return badges
} 