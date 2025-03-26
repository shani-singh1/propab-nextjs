import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const [posts, socialConnections] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: session.user.id },
        select: { content: true }
      }),
      prisma.socialConnection.findMany({
        where: { userId: session.user.id },
        include: { analysis: true }
      })
    ])

    // Combine all text data for analysis
    const textData = [
      ...posts.map(p => p.content),
      ...socialConnections.flatMap(conn => 
        conn.analysis ? [conn.analysis.personality] : []
      )
    ]

    // Analyze combined data
    const analysis = await analyzePersonality(textData)

    // Update or create personality profile
    await prisma.personalityProfile.upsert({
      where: { userId: session.user.id },
      update: { traits: analysis },
      create: {
        userId: session.user.id,
        traits: analysis
      }
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing personality:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

async function analyzePersonality(textData) {
  // For now, return mock data until we implement the actual ML model
  return {
    openness: 0.75,
    conscientiousness: 0.68,
    extraversion: 0.62,
    agreeableness: 0.81,
    neuroticism: 0.45,
    traits: {
      analytical: 0.72,
      creative: 0.65,
      leadership: 0.58,
      communication: 0.77
    }
  }
} 