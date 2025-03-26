import { ConnectionAIService } from "./connection-ai"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export class AutopilotService {
  constructor(userId) {
    this.userId = userId
    this.connectionService = new ConnectionAIService(userId)
  }

  async shouldRun() {
    const settings = await prisma.autopilotSettings.findUnique({
      where: { userId: this.userId }
    })

    if (!settings) return true // Default to always run if no settings

    // Check active hours
    if (settings.activeHours) {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      if (currentTime < settings.activeHours.start || currentTime > settings.activeHours.end) {
        return false
      }
    }

    // Check last run time to prevent too frequent runs
    const lastSession = await prisma.autopilotSession.findFirst({
      where: { userId: this.userId },
      orderBy: { createdAt: 'desc' }
    })

    if (lastSession) {
      const hoursSinceLastRun = (Date.now() - lastSession.createdAt.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastRun < 1) { // Minimum 1 hour between runs
        return false
      }
    }

    return true
  }

  async start(settings, sessionId) {
    try {
      // Check if autopilot should run
      if (!await this.shouldRun()) {
        await this.logActivity("warning", "Autopilot skipped - Outside active hours or too soon")
        return
      }

      // Log start activity
      await this.logActivity("info", "Starting autopilot session")

      // Get potential connections
      const suggestions = await this.connectionService.findPotentialConnections()

      // Filter by minimum compatibility and blacklist
      const validSuggestions = suggestions.filter(s => 
        s.compatibility.score >= settings.minCompatibility &&
        !settings.blacklist?.includes(s.user.id)
      ).slice(0, settings.maxConnections)

      // Process each suggestion
      for (const suggestion of validSuggestions) {
        await this.processSuggestion(suggestion, settings)
        
        // Update progress
        const progress = (validSuggestions.indexOf(suggestion) + 1) / validSuggestions.length
        await this.updateProgress(sessionId, progress)

        // Add delay between connections to appear more natural
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 5000))
      }

      // Complete session
      await this.completeSession(sessionId)
      await this.logActivity("success", "Autopilot session completed")
    } catch (error) {
      console.error("Autopilot error:", error)
      await this.logActivity("error", "Autopilot encountered an error")
      await this.failSession(sessionId)
    }
  }

  private async processSuggestion(suggestion, settings) {
    try {
      // Create connection
      const connection = await prisma.twinConnection.create({
        data: {
          userId: this.userId,
          twinId: suggestion.user.id,
          compatibility: suggestion.compatibility.score,
          status: "PENDING",
          createdBy: "AUTOPILOT",
          notes: settings.autoMessage ? await this.generateMessage(suggestion) : null
        }
      })

      await this.logActivity(
        "connection",
        `Connected with ${suggestion.user.name}`
      )

      return connection
    } catch (error) {
      console.error("Error processing suggestion:", error)
      await this.logActivity(
        "warning",
        `Failed to connect with ${suggestion.user.name}`
      )
      throw error
    }
  }

  private async generateMessage(suggestion) {
    // Generate personalized message using AI
    return "Hi! I noticed we have similar interests in..."
  }

  private async updateProgress(sessionId, progress) {
    await prisma.autopilotSession.update({
      where: { id: sessionId },
      data: { progress }
    })

    // Send real-time update
    await pusherServer.trigger(
      `autopilot-${this.userId}`,
      "progress",
      { progress: Math.round(progress * 100) }
    )
  }

  private async completeSession(sessionId) {
    await prisma.autopilotSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date()
      }
    })
  }

  private async failSession(sessionId) {
    await prisma.autopilotSession.update({
      where: { id: sessionId },
      data: {
        status: "FAILED",
        completedAt: new Date()
      }
    })
  }

  private async logActivity(type, message) {
    await prisma.autopilotActivity.create({
      data: {
        userId: this.userId,
        type,
        message
      }
    })

    // Send real-time update
    await pusherServer.trigger(
      `autopilot-${this.userId}`,
      "activity",
      { type, message, timestamp: new Date() }
    )
  }
} 