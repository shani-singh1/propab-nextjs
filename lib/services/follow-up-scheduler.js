import prisma from "@/lib/prisma"
import { MessageGenerationService } from "./message-generation"

export class FollowUpScheduler {
  constructor(userId) {
    this.userId = userId
    this.messageService = new MessageGenerationService(userId)
  }

  async scheduleFollowUps() {
    const connections = await this.getConnectionsNeedingFollowUp()
    
    for (const connection of connections) {
      await this.scheduleFollowUp(connection)
    }
  }

  private async getConnectionsNeedingFollowUp() {
    const connections = await prisma.twinConnection.findMany({
      where: {
        userId: this.userId,
        status: "ACCEPTED",
        NOT: {
          followUps: {
            some: {
              scheduledFor: {
                gte: new Date()
              }
            }
          }
        }
      },
      include: {
        twin: true,
        interactions: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    })

    return connections.filter(connection => 
      this.shouldScheduleFollowUp(connection)
    )
  }

  private shouldScheduleFollowUp(connection) {
    const lastInteraction = connection.interactions[0]
    if (!lastInteraction) return true

    const daysSinceLastInteraction = Math.floor(
      (Date.now() - lastInteraction.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Schedule follow-up based on connection stage
    const stage = this.determineConnectionStage(connection)
    return daysSinceLastInteraction > this.getFollowUpInterval(stage)
  }

  private determineConnectionStage(connection) {
    const interactionCount = connection.interactions.length
    const connectionAge = Math.floor(
      (Date.now() - connection.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (interactionCount === 0) return "NEW"
    if (interactionCount < 3 || connectionAge < 30) return "DEVELOPING"
    if (interactionCount < 10 || connectionAge < 90) return "ESTABLISHED"
    return "MATURE"
  }

  private getFollowUpInterval(stage) {
    switch (stage) {
      case "NEW": return 3 // 3 days
      case "DEVELOPING": return 7 // 1 week
      case "ESTABLISHED": return 14 // 2 weeks
      case "MATURE": return 30 // 1 month
      default: return 7
    }
  }

  private async scheduleFollowUp(connection) {
    const stage = this.determineConnectionStage(connection)
    const daysToAdd = this.getFollowUpInterval(stage)
    const scheduledFor = new Date()
    scheduledFor.setDate(scheduledFor.getDate() + daysToAdd)

    const message = await this.messageService.generateFollowUp(
      connection.twin,
      connection.id
    )

    await prisma.followUp.create({
      data: {
        connectionId: connection.id,
        scheduledFor,
        message,
        status: "SCHEDULED"
      }
    })
  }
} 