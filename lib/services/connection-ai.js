import { HuggingFaceApi } from "@/lib/huggingface"
import prisma from "@/lib/prisma"

export class ConnectionAIService {
  constructor(userId) {
    this.userId = userId
    this.huggingFace = new HuggingFaceApi()
  }

  async findPotentialConnections() {
    const [userProfile, recentInteractions] = await Promise.all([
      this.getUserProfile(),
      this.getRecentInteractions()
    ])

    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { not: this.userId },
        NOT: {
          OR: [
            { followers: { some: { followerId: this.userId } } },
            { following: { some: { followingId: this.userId } } }
          ]
        }
      },
      include: {
        personalityProfile: true,
        interests: true
      }
    })

    const scoredMatches = await Promise.all(
      potentialMatches.map(async (match) => ({
        user: match,
        compatibility: await this.calculateCompatibility(userProfile, match),
        connectionNotes: await this.generateConnectionNotes(userProfile, match)
      }))
    )

    return scoredMatches.sort((a, b) => b.compatibility.score - a.compatibility.score)
  }

  private async getUserProfile() {
    return prisma.user.findUnique({
      where: { id: this.userId },
      include: {
        personalityProfile: true,
        interests: true
      }
    })
  }

  private async getRecentInteractions() {
    return prisma.interaction.findMany({
      where: { userId: this.userId },
      orderBy: { createdAt: "desc" },
      take: 50
    })
  }

  private async calculateCompatibility(userProfile, potentialMatch) {
    const factors = {
      personality: this.comparePersonality(
        userProfile.personalityProfile,
        potentialMatch.personalityProfile
      ),
      interests: this.compareInterests(
        userProfile.interests,
        potentialMatch.interests
      ),
      goals: await this.compareGoals(userProfile, potentialMatch)
    }

    const weights = {
      personality: 0.4,
      interests: 0.3,
      goals: 0.3
    }

    const score = Object.entries(factors).reduce(
      (total, [key, value]) => total + value * weights[key],
      0
    )

    return {
      score,
      factors,
      insights: await this.generateCompatibilityInsights(factors)
    }
  }

  private comparePersonality(profile1, profile2) {
    // Implement personality trait comparison logic
    return 0.8 // Placeholder
  }

  private compareInterests(interests1, interests2) {
    // Implement interest comparison logic
    return 0.7 // Placeholder
  }

  private async compareGoals(user1, user2) {
    // Implement goal alignment comparison logic
    return 0.9 // Placeholder
  }

  private async generateCompatibilityInsights(factors) {
    const prompt = this.constructInsightPrompt(factors)
    const response = await this.huggingFace.query("gpt2-large", {
      inputs: prompt
    })
    return this.parseInsights(response)
  }

  private async generateConnectionNotes(userProfile, potentialMatch) {
    const prompt = this.constructNotesPrompt(userProfile, potentialMatch)
    const response = await this.huggingFace.query("gpt2-large", {
      inputs: prompt
    })
    return this.parseNotes(response)
  }

  // Helper methods for prompt construction and response parsing
  private constructInsightPrompt(factors) {
    return `Analyze the compatibility factors:
      Personality Match: ${factors.personality}
      Interest Alignment: ${factors.interests}
      Goal Compatibility: ${factors.goals}
      
      Generate insights about:
      1. Potential synergies
      2. Growth opportunities
      3. Possible challenges
      4. Recommended interaction approaches`
  }

  private constructNotesPrompt(userProfile, potentialMatch) {
    return `Based on the profiles:
      User: ${JSON.stringify(userProfile)}
      Potential Match: ${JSON.stringify(potentialMatch)}
      
      Generate personalized connection notes covering:
      1. Common interests and experiences
      2. Potential conversation topics
      3. Professional synergies
      4. Recommended ice-breakers`
  }

  private parseInsights(response) {
    // Parse and structure the insights
    return {
      synergies: ["Complementary skills", "Shared vision"],
      opportunities: ["Knowledge exchange", "Network expansion"],
      challenges: ["Different communication styles"],
      recommendations: ["Focus on common interests"]
    }
  }

  private parseNotes(response) {
    // Parse and structure the connection notes
    return {
      topics: ["Industry trends", "Shared experiences"],
      icebreakers: ["Ask about recent project"],
      professionalSynergies: ["Potential collaboration areas"],
      nextSteps: ["Schedule informal chat"]
    }
  }
} 