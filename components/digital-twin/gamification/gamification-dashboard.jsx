"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { pusherClient } from "@/lib/pusher"
import { ProgressCard } from "./progress-card"
import { AchievementsGrid } from "./achievements-grid"
import { RewardsList } from "./rewards-list"
import { AchievementOverlay } from "./achievement-overlay"
import { RewardOverlay } from "./reward-overlay"

export function GamificationDashboard({ userId }) {
  const [stats, setStats] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [rewards, setRewards] = useState([])
  const [showingAchievement, setShowingAchievement] = useState(null)
  const [showingReward, setShowingReward] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    loadGamificationData()

    // Subscribe to real-time updates
    const channel = pusherClient.subscribe(`user-${userId}`)
    
    channel.bind("rewards", (data) => {
      setRewards(prev => [...data.rewards, ...prev])
      setShowingReward(data.rewards[0])
    })

    channel.bind("achievement", (data) => {
      setAchievements(prev => 
        prev.map(a => 
          a.id === data.achievement.id ? data.achievement : a
        )
      )
      setShowingAchievement(data.achievement)
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [userId])

  const loadGamificationData = async () => {
    try {
      const [statsRes, achievementsRes, rewardsRes] = await Promise.all([
        fetch(`/api/digital-twin/${userId}/gamification/stats`),
        fetch(`/api/digital-twin/${userId}/achievements`),
        fetch(`/api/digital-twin/${userId}/rewards`)
      ])

      if (!statsRes.ok || !achievementsRes.ok || !rewardsRes.ok) throw new Error()

      const [statsData, achievementsData, rewardsData] = await Promise.all([
        statsRes.json(),
        achievementsRes.json(),
        rewardsRes.json()
      ])

      setStats(statsData)
      setAchievements(achievementsData)
      setRewards(rewardsData)
    } catch (error) {
      console.error("Error loading gamification data:", error)
      toast.error("Failed to load gamification data")
    }
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      <ProgressCard
        level={stats.level}
        experience={stats.experience}
        nextLevelXP={stats.nextLevelXP}
      />
      <div className="grid grid-cols-2 gap-6">
        <AchievementsGrid achievements={achievements} />
        <RewardsList rewards={rewards} />
      </div>

      <AchievementOverlay
        achievement={showingAchievement}
        onComplete={() => setShowingAchievement(null)}
      />

      <RewardOverlay
        reward={showingReward}
        onClaim={async () => {
          if (showingReward) {
            await handleClaim(showingReward.id)
            setShowingReward(null)
          }
        }}
        onClose={() => setShowingReward(null)}
      />
    </div>
  )
} 