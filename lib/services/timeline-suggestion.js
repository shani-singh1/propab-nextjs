import { HuggingFaceApi } from "@/lib/huggingface"
import prisma from "@/lib/prisma"

export class TimelineSuggestionService {
  constructor(userId) {
    this.userId = userId
    this.huggingFace = new HuggingFaceApi()
  }

  async generateSuggestions(memory) {
    const [
      personalityProfile,
      recentMemories,
      interactions
    ] = await Promise.all([
      this.getPersonalityProfile(),
      this.getRecentMemories(),
      this.getRelevantInteractions(memory)
    ])

    const suggestions = await this.analyzePossibilities({
      memory,
      personalityProfile,
      recentMemories,
      interactions
    })

    return this.rankSuggestions(suggestions)
  }

  private async getPersonalityProfile() {
    return prisma.personalityProfile.findUnique({
      where: { userId: this.userId }
    })
  }

  private async getRecentMemories() {
    return prisma.memory.findMany({
      where: { userId: this.userId },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  }

  private async getRelevantInteractions(memory) {
    return prisma.interaction.findMany({
      where: {
        userId: this.userId,
        topics: {
          hasSome: memory.topics
        }
      },
      take: 5
    })
  }

  private async analyzePossibilities(context) {
    const prompt = this.constructAnalysisPrompt(context)
    const analysis = await this.huggingFace.query(
      "gpt2-large",
      { inputs: prompt }
    )

    return this.parseAnalysis(analysis)
  }

  private constructAnalysisPrompt(context) {
    const { memory, personalityProfile, recentMemories } = context
    
    return `Given the following context:
      Current Memory: ${memory.content}
      Topics: ${memory.topics.join(", ")}
      
      Personality Profile:
      ${JSON.stringify(personalityProfile.traits)}
      
      Recent Experiences:
      ${recentMemories.map(m => `- ${m.content}`).join("\n")}
      
      Suggest 3 alternative timelines considering:
      1. Personal growth opportunities
      2. Relationship dynamics
      3. Career/life goals
      4. Risk vs reward
      5. Alignment with personality traits`
  }

  private parseAnalysis(analysis) {
    // This would be replaced with actual parsing logic
    return [
      {
        title: "Growth-Focused Path",
        description: "Prioritize personal development...",
        variables: {
          focus: "skill development",
          approach: "proactive learning"
        },
        alignment: 0.85
      },
      {
        title: "Balanced Approach",
        description: "Maintain equilibrium...",
        variables: {
          focus: "work-life balance",
          approach: "steady progress"
        },
        alignment: 0.75
      },
      {
        title: "Bold Change",
        description: "Embrace transformation...",
        variables: {
          focus: "major transition",
          approach: "decisive action"
        },
        alignment: 0.65
      }
    ]
  }

  private rankSuggestions(suggestions) {
    return suggestions.sort((a, b) => b.alignment - a.alignment)
  }
} 