import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { analyzePersonality } from "@/lib/ai/personality-analysis"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params

    const [profile, interactions, learningPoints] = await Promise.all([
      prisma.personalityProfile.findUnique({
        where: { userId }
      }),
      prisma.interaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.learningPoint.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ])

    // Generate AI insights
    const insights = await analyzePersonality({
      profile,
      interactions,
      learningPoints
    })

    return NextResponse.json({
      traits: profile?.traits || {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5
      },
      keyInsights: insights.key || [
        "Shows strong analytical thinking",
        "Prefers structured communication",
        "Values knowledge sharing"
      ],
      growthAreas: insights.growth || [
        {
          name: "Leadership Skills",
          description: "Opportunity to develop team coordination"
        },
        {
          name: "Technical Expertise",
          description: "Expanding knowledge in emerging technologies"
        }
      ]
    })
  } catch (error) {
    console.error("Error fetching personality insights:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 