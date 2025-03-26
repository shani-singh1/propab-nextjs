import { MESSAGE_TEMPLATES, VARIABLES } from "@/lib/constants/message-templates"
import { analyzeText } from "@/lib/ai/text-analysis"
import prisma from "@/lib/prisma"

export class MessageGenerationService {
  constructor(userId) {
    this.userId = userId
  }

  async generateInitialMessage(targetUser, context) {
    const style = await this.determineMessageStyle(targetUser)
    const templates = MESSAGE_TEMPLATES[style].INITIAL
    const template = await this.selectBestTemplate(templates, context)
    
    return this.personalizeMessage(template, targetUser, context)
  }

  async generateFollowUp(targetUser, connectionId) {
    const connection = await prisma.twinConnection.findUnique({
      where: { id: connectionId },
      include: { interactions: true }
    })

    const context = await this.buildFollowUpContext(connection)
    const style = await this.determineMessageStyle(targetUser)
    const templates = MESSAGE_TEMPLATES[style].FOLLOW_UP
    const template = await this.selectBestTemplate(templates, context)

    return this.personalizeMessage(template, targetUser, context)
  }

  private async determineMessageStyle(targetUser) {
    const profile = await prisma.personalityProfile.findUnique({
      where: { userId: targetUser.id }
    })

    if (!profile) return "PROFESSIONAL"

    // Determine style based on personality traits and context
    const formality = profile.traits?.formality || 0.5
    const professionalism = profile.traits?.professionalism || 0.5

    if (formality > 0.7 || professionalism > 0.7) return "PROFESSIONAL"
    if (profile.interests?.includes("technical")) return "SKILL_BASED"
    return "CASUAL"
  }

  private async selectBestTemplate(templates, context) {
    const validTemplates = templates.filter(template => 
      this.checkConditions(template.conditions, context)
    )

    if (validTemplates.length === 0) {
      return templates[0] // Fallback to first template
    }

    // Score templates based on context match
    const scoredTemplates = await Promise.all(
      validTemplates.map(async template => ({
        template,
        score: await this.scoreTemplate(template, context)
      }))
    )

    return scoredTemplates.sort((a, b) => b.score - a.score)[0].template
  }

  private checkConditions(conditions, context) {
    if (!conditions) return true

    return Object.entries(conditions).every(([key, value]) => {
      switch (key) {
        case "minCompatibility":
          return context.compatibility >= value
        case "hasRecentActivity":
          return !!context.recentActivity
        case "connectionAge":
          return context.connectionAge === value
        case "skillMatch":
          return context.commonSkills?.length > 0
        default:
          return true
      }
    })
  }

  private async scoreTemplate(template, context) {
    // Score based on variable availability
    const variableScore = this.getVariableScore(template, context)

    // Score based on sentiment analysis
    const sentimentScore = await this.analyzeSentiment(template.template)

    // Score based on length appropriateness
    const lengthScore = this.getLengthScore(template.template)

    return (variableScore * 0.5) + (sentimentScore * 0.3) + (lengthScore * 0.2)
  }

  private getVariableScore(template, context) {
    const variables = template.template.match(/{{(.*?)}}/g) || []
    const availableVars = variables.filter(v => {
      const varName = v.replace(/[{}]/g, '')
      return VARIABLES[varName] && VARIABLES[varName](context.user, context)
    })

    return availableVars.length / variables.length
  }

  private async analyzeSentiment(text) {
    const sentiment = await analyzeText(text)
    return (sentiment + 1) / 2 // Normalize to 0-1
  }

  private getLengthScore(text) {
    const length = text.length
    const optimal = 150
    const diff = Math.abs(length - optimal)
    return Math.max(0, 1 - (diff / optimal))
  }

  private personalizeMessage(template, user, context) {
    let message = template.template

    // Replace variables
    const variables = message.match(/{{(.*?)}}/g) || []
    variables.forEach(variable => {
      const varName = variable.replace(/[{}]/g, '')
      const value = VARIABLES[varName]?.(user, context) || ''
      message = message.replace(variable, value)
    })

    return message
  }

  private async buildFollowUpContext(connection) {
    const interactions = connection.interactions || []
    const lastInteraction = interactions[interactions.length - 1]

    return {
      connectionAge: this.getConnectionAge(connection.createdAt),
      interactionCount: interactions.length,
      lastInteractionType: lastInteraction?.type,
      lastInteractionSentiment: lastInteraction?.sentiment,
      suggestedTopic: await this.suggestNextTopic(connection)
    }
  }

  private getConnectionAge(createdAt) {
    const days = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24))
    if (days < 7) return "new"
    if (days < 30) return "recent"
    return "established"
  }

  private async suggestNextTopic(connection) {
    // Implement topic suggestion logic based on previous interactions
    // and shared interests
    return "shared professional goals" // Placeholder
  }
} 