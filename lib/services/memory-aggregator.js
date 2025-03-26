import { HuggingFaceApi } from "@/lib/huggingface"
import prisma from "@/lib/prisma"

export class MemoryAggregator {
  constructor(userId) {
    this.userId = userId
    this.huggingFace = new HuggingFaceApi()
  }

  async aggregateMemories(timeframe = '30d') {
    const memories = await this.fetchRecentMemories(timeframe)
    const clusters = await this.clusterMemories(memories)
    const insights = await this.generateInsights(clusters)
    return this.createMemoryMap(clusters, insights)
  }

  async fetchRecentMemories(timeframe) {
    const fromDate = this.calculateFromDate(timeframe)

    return prisma.memory.findMany({
      where: {
        userId: this.userId,
        createdAt: {
          gte: fromDate
        }
      },
      orderBy: {
        importance: 'desc'
      },
      include: {
        interactions: true
      }
    })
  }

  async clusterMemories(memories) {
    // Group memories by type and topic
    const clusters = {}
    
    for (const memory of memories) {
      for (const topic of memory.topics) {
        if (!clusters[topic]) {
          clusters[topic] = {
            memories: [],
            sentiment: 0,
            importance: 0,
            interactions: 0
          }
        }
        
        clusters[topic].memories.push(memory)
        clusters[topic].sentiment += memory.sentiment || 0
        clusters[topic].importance += memory.importance
        clusters[topic].interactions += memory.interactions.length
      }
    }

    // Normalize scores
    Object.values(clusters).forEach(cluster => {
      cluster.sentiment /= cluster.memories.length
      cluster.importance /= cluster.memories.length
    })

    return clusters
  }

  async generateInsights(clusters) {
    const insights = []
    
    for (const [topic, cluster] of Object.entries(clusters)) {
      // Generate summary of memories
      const memoryTexts = cluster.memories
        .map(m => m.content)
        .join(" ")
      
      const summary = await this.huggingFace.summarize(memoryTexts)
      
      // Calculate growth metrics
      const growth = this.calculateGrowthMetrics(cluster.memories)
      
      insights.push({
        topic,
        summary,
        sentiment: cluster.sentiment,
        importance: cluster.importance,
        interactions: cluster.interactions,
        growth,
        learningPoints: this.calculateLearningPoints(cluster)
      })
    }

    return insights
  }

  createMemoryMap(clusters, insights) {
    return {
      clusters,
      insights,
      stats: {
        totalMemories: Object.values(clusters)
          .reduce((sum, c) => sum + c.memories.length, 0),
        topTopics: insights
          .sort((a, b) => b.importance - a.importance)
          .slice(0, 5),
        sentimentTrend: this.calculateSentimentTrend(clusters),
        learningProgress: this.calculateLearningProgress(insights)
      }
    }
  }

  private calculateGrowthMetrics(memories) {
    // Sort memories by date
    const sorted = [...memories].sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    )

    // Calculate growth rate
    const timeSpan = sorted[sorted.length - 1].createdAt - sorted[0].createdAt
    const daysSpan = timeSpan / (1000 * 60 * 60 * 24)
    
    return {
      rate: memories.length / daysSpan,
      trend: this.calculateTrend(sorted.map(m => m.importance))
    }
  }

  private calculateTrend(values) {
    // Simple linear regression
    const n = values.length
    const indices = Array.from({length: n}, (_, i) => i)
    
    const sumX = indices.reduce((a, b) => a + b, 0)
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0)
    const sumXX = indices.reduce((sum, x) => sum + x * x, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    return slope
  }

  private calculateLearningPoints(cluster) {
    const basePoints = cluster.importance * 100
    const multiplier = 1 + (cluster.interactions * 0.1)
    return Math.round(basePoints * multiplier)
  }

  private calculateSentimentTrend(clusters) {
    const sentiments = Object.values(clusters).map(c => c.sentiment)
    return this.calculateTrend(sentiments)
  }

  private calculateLearningProgress(insights) {
    const totalPoints = insights.reduce((sum, i) => sum + i.learningPoints, 0)
    const maxPoints = insights.length * 1000 // Arbitrary max points per topic
    return (totalPoints / maxPoints) * 100
  }

  private calculateFromDate(timeframe) {
    const now = new Date()
    const days = parseInt(timeframe)
    return new Date(now.setDate(now.getDate() - days))
  }
} 