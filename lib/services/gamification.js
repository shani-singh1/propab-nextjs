import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export class GamificationService {
  constructor(userId) {
    this.userId = userId
  }

  async handleAction(action, data = {}) {
    try {
      const rewards = await this.processAction(action, data)
      await this.updateStreaks(action)
      await this.checkAchievements()
      
      if (rewards.length > 0) {
        await this.notifyRewards(rewards)
      }

      return rewards
    } catch (error) {
      console.error("Error handling gamification action:", error)
      throw error
    }
  }

  private async processAction(action, data) {
    const rewards = []
    const xpGains = this.calculateXP(action, data)

    // Update user experience and level
    const user = await this.updateExperience(xpGains)
    
    // Check for level-up rewards
    if (user.level > data.previousLevel) {
      rewards.push(...await this.createLevelUpRewards(user.level))
    }

    // Create action-specific rewards
    const actionRewards = await this.createActionRewards(action, data)
    rewards.push(...actionRewards)

    return rewards
  }

  private calculateXP(action, data) {
    const baseXP = {
      CONNECTION: 50,
      MESSAGE: 10,
      VOICE_CHAT: 30,
      VIDEO_CHAT: 40,
      ANALYSIS: 20,
      TIMELINE_CREATE: 25,
      AUTOPILOT: 15
    }

    let multiplier = 1
    
    // Apply multipliers based on action quality
    if (data.quality === "high") multiplier *= 1.5
    if (data.streak) multiplier *= (1 + (data.streak * 0.1))

    return Math.round(baseXP[action] * multiplier)
  }

  private async updateExperience(xpGains) {
    const user = await prisma.user.findUnique({
      where: { id: this.userId },
      select: { experience: true, level: true }
    })

    const previousLevel = user.level
    const newXP = user.experience + xpGains
    const newLevel = this.calculateLevel(newXP)

    return prisma.user.update({
      where: { id: this.userId },
      data: {
        experience: newXP,
        level: newLevel
      }
    })
  }

  private calculateLevel(xp) {
    // Simple level calculation: each level requires 20% more XP
    let level = 1
    let requiredXP = 1000 // Base XP for level 2

    while (xp >= requiredXP) {
      level++
      requiredXP = Math.round(requiredXP * 1.2)
    }

    return level
  }

  private async updateStreaks(action) {
    const streak = await prisma.streak.findFirst({
      where: {
        userId: this.userId,
        type: action
      }
    })

    const now = new Date()
    const lastActive = streak?.lastActive || new Date(0)
    const daysSinceLastActive = Math.floor(
      (now - lastActive) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastActive > 1) {
      // Streak broken
      await prisma.streak.upsert({
        where: {
          id: streak?.id || "new"
        },
        create: {
          userId: this.userId,
          type: action,
          count: 1,
          lastActive: now
        },
        update: {
          count: 1,
          lastActive: now
        }
      })
    } else if (daysSinceLastActive === 1) {
      // Streak continues
      const newCount = (streak?.count || 0) + 1
      await prisma.streak.upsert({
        where: {
          id: streak?.id || "new"
        },
        create: {
          userId: this.userId,
          type: action,
          count: newCount,
          lastActive: now,
          longestStreak: newCount
        },
        update: {
          count: newCount,
          lastActive: now,
          longestStreak: Math.max(newCount, streak?.longestStreak || 0)
        }
      })
    }
  }

  private async checkAchievements() {
    const achievements = await prisma.achievement.findMany({
      where: {
        userId: this.userId,
        completed: false
      }
    })

    for (const achievement of achievements) {
      const progress = await this.calculateAchievementProgress(achievement)
      
      if (progress >= 1) {
        await this.completeAchievement(achievement)
      } else {
        await this.updateAchievementProgress(achievement, progress)
      }
    }
  }

  private async calculateAchievementProgress(achievement) {
    // Calculate progress based on achievement type
    switch (achievement.type) {
      case "CONNECTOR":
        const connections = await prisma.twinConnection.count({
          where: { userId: this.userId }
        })
        return connections / 100 // Example: 100 connections needed

      case "ANALYST":
        const analyses = await prisma.interaction.count({
          where: { userId: this.userId }
        })
        return analyses / 50 // Example: 50 analyses needed

      // Add more achievement types...
      default:
        return 0
    }
  }

  private async completeAchievement(achievement) {
    await prisma.achievement.update({
      where: { id: achievement.id },
      data: {
        completed: true,
        completedAt: new Date(),
        progress: 1
      }
    })

    await this.notifyAchievement(achievement)
  }

  private async updateAchievementProgress(achievement, progress) {
    await prisma.achievement.update({
      where: { id: achievement.id },
      data: { progress }
    })
  }

  private async notifyRewards(rewards) {
    await pusherServer.trigger(
      `user-${this.userId}`,
      "rewards",
      { rewards }
    )
  }

  private async notifyAchievement(achievement) {
    await pusherServer.trigger(
      `user-${this.userId}`,
      "achievement",
      { achievement }
    )
  }

  private async createLevelUpRewards(level) {
    return prisma.reward.create({
      data: {
        userId: this.userId,
        type: "LEVEL_UP",
        name: `Level ${level} Reward`,
        description: `Reward for reaching level ${level}`,
        value: level * 100 // XP boost based on level
      }
    })
  }

  private async createActionRewards(action, data) {
    const rewards = []

    // Create special rewards based on actions and conditions
    if (action === "CONNECTION" && data.compatibility > 0.9) {
      rewards.push(await prisma.reward.create({
        data: {
          userId: this.userId,
          type: "HIGH_COMPATIBILITY",
          name: "Perfect Match",
          description: "Connected with someone with exceptional compatibility",
          value: 200
        }
      }))
    }

    return rewards
  }
} 