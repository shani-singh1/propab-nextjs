import { GamificationService } from "@/lib/services/gamification"

export async function trackAction(userId, action, data = {}) {
  try {
    const gamificationService = new GamificationService(userId)
    return await gamificationService.handleAction(action, data)
  } catch (error) {
    console.error(`Error tracking action ${action}:`, error)
  }
} 