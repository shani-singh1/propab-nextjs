import { AI } from "./huggingface"
import { redis } from "@/lib/redis"

const CACHE_TTL = 3600 // 1 hour in seconds

export async function analyzePersonality({ profile, interactions, learningPoints }) {
  try {
    const cacheKey = `personality:${profile?.userId}:${getLatestTimestamp(interactions)}`
    const cached = await redis.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    const ai = new AI()
    const analysisData = {
      traits: profile?.traits || {},
      interests: profile?.interests || [],
      interactionPatterns: await analyzeInteractions(interactions, ai),
      learningTrends: analyzeLearningPoints(learningPoints)
    }

    const insights = await generateAIInsights(analysisData, ai)
    const result = {
      key: insights.keyInsights,
      growth: insights.growthAreas,
      recommendations: insights.recommendations
    }

    // Cache the results
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result))
    return result
  } catch (error) {
    console.error("Error in personality analysis:", error)
    return {
      key: [],
      growth: [],
      recommendations: []
    }
  }
}

async function analyzeInteractions(interactions, ai) {
  const patterns = {
    communicationStyle: {},
    responseTime: [],
    topicPreferences: new Set(),
    engagementLevels: []
  }

  // Process interactions in batches to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < interactions.length; i += batchSize) {
    const batch = interactions.slice(i, i + batchSize)
    await Promise.all(batch.map(async interaction => {
      const analysis = await ai.textClassification(interaction.content)
      patterns.communicationStyle[analysis[0]?.label] = 
        (patterns.communicationStyle[analysis[0]?.label] || 0) + 1

      if (interaction.responseTime) {
        patterns.responseTime.push(interaction.responseTime)
      }

      const topics = await ai.extractKeywords(interaction.content)
      topics.forEach(topic => patterns.topicPreferences.add(topic))

      if (interaction.engagementScore) {
        patterns.engagementLevels.push(interaction.engagementScore)
      }
    }))
  }

  return {
    dominantStyle: getDominantStyle(patterns.communicationStyle),
    averageResponseTime: calculateAverage(patterns.responseTime),
    preferredTopics: Array.from(patterns.topicPreferences),
    averageEngagement: calculateAverage(patterns.engagementLevels)
  }
}

function analyzeLearningPoints(points) {
  const trends = {
    categories: {},
    progress: [],
    challenges: new Set(),
    strengths: new Set()
  }

  points.forEach(point => {
    trends.categories[point.category] = (trends.categories[point.category] || 0) + 1

    if (point.progressScore) {
      trends.progress.push(point.progressScore)
    }

    if (point.type === 'CHALLENGE') {
      trends.challenges.add(point.area)
    } else if (point.type === 'STRENGTH') {
      trends.strengths.add(point.area)
    }
  })

  return {
    focusAreas: Object.entries(trends.categories)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category),
    averageProgress: calculateAverage(trends.progress),
    challenges: Array.from(trends.challenges),
    strengths: Array.from(trends.strengths)
  }
}

async function generateAIInsights(data, ai) {
  const prompt = `
    Analyze the following user data and generate insights:
    
    Personality Traits:
    ${JSON.stringify(data.traits, null, 2)}
    
    Interaction Patterns:
    ${JSON.stringify(data.interactionPatterns, null, 2)}
    
    Learning Trends:
    ${JSON.stringify(data.learningTrends, null, 2)}
    
    Generate:
    1. 3-5 key insights about the personality
    2. 2-3 growth areas with specific opportunities
    3. 2-3 actionable recommendations
  `

  try {
    const response = await ai.textGeneration(prompt)
    const structuredResponse = structureGeneratedText(response)
    
    return {
      keyInsights: structuredResponse.insights || [],
      growthAreas: structuredResponse.growth || [],
      recommendations: structuredResponse.recommendations || []
    }
  } catch (error) {
    console.error("Error generating AI insights:", error)
    return {
      keyInsights: [],
      growthAreas: [],
      recommendations: []
    }
  }
}

function structureGeneratedText(text) {
  const sections = text.split(/\d+\./).filter(Boolean)
  
  return {
    insights: extractListItems(sections[0]),
    growth: extractGrowthAreas(sections[1]),
    recommendations: extractListItems(sections[2])
  }
}

function extractListItems(text) {
  return text
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-•*]\s*/, ''))
}

function extractGrowthAreas(text) {
  return text
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const [name, ...descParts] = line.replace(/^[-•*]\s*/, '').split(':')
      return {
        name: name.trim(),
        description: descParts.join(':').trim()
      }
    })
}

function getDominantStyle(styles) {
  return Object.entries(styles)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'
}

function calculateAverage(numbers) {
  return numbers.length > 0
    ? numbers.reduce((sum, num) => sum + num, 0) / numbers.length
    : 0
}

function getLatestTimestamp(interactions) {
  return interactions.length > 0
    ? new Date(Math.max(...interactions.map(i => new Date(i.createdAt)))).getTime()
    : Date.now()
} 