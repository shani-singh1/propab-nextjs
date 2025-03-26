import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit")) || 50

    const memories = await prisma.memory.findMany({
      where: { userId },
      orderBy: [
        { importance: "desc" },
        { createdAt: "desc" }
      ],
      take: limit,
      include: {
        interactions: {
          select: {
            type: true,
            sentiment: true,
            topics: true
          }
        }
      }
    })

    // Enrich memories with AI-generated context
    const enrichedMemories = await Promise.all(
      memories.map(async (memory) => {
        const context = await generateMemoryContext(memory)
        return {
          ...memory,
          context
        }
      })
    )

    return NextResponse.json(enrichedMemories)
  } catch (error) {
    console.error("Error getting memories:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

async function generateMemoryContext(memory) {
  // This would be replaced with actual AI analysis
  return {
    significance: calculateSignificance(memory),
    relatedMemories: await findRelatedMemories(memory),
    potentialImpact: assessPotentialImpact(memory)
  }
}

function calculateSignificance(memory) {
  const interactionWeight = memory.interactions.length * 0.2
  const sentimentStrength = Math.abs(
    memory.interactions.reduce((sum, i) => sum + (i.sentiment || 0), 0) /
    Math.max(memory.interactions.length, 1)
  )
  
  return Math.min(
    1,
    memory.importance + interactionWeight + (sentimentStrength * 0.3)
  )
}

async function findRelatedMemories(memory) {
  const related = await prisma.memory.findMany({
    where: {
      userId: memory.userId,
      id: { not: memory.id },
      topics: {
        hasSome: memory.topics
      }
    },
    take: 3,
    orderBy: { importance: "desc" }
  })

  return related.map(m => ({
    id: m.id,
    preview: m.content.toString().slice(0, 100),
    commonTopics: m.topics.filter(t => memory.topics.includes(t))
  }))
}

function assessPotentialImpact(memory) {
  const baseImpact = memory.importance
  const recentness = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  const recencyFactor = Math.exp(-recentness / 365) // Decay over time

  return {
    score: baseImpact * recencyFactor,
    factors: {
      importance: baseImpact,
      recency: recencyFactor,
      interactions: memory.interactions.length
    }
  }
} 