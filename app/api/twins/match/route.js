import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { calculateTwinScore } from "@/lib/twin-matching"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user's profile with personality data
    const userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        personalityProfile: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true
          }
        }
      }
    })

    // Find potential twins (excluding current connections)
    const existingConnections = await prisma.twinConnection.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { twinId: session.user.id }
        ]
      }
    })

    const excludeIds = [
      session.user.id,
      ...existingConnections.map(c => c.userId),
      ...existingConnections.map(c => c.twinId)
    ]

    const potentialTwins = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        personalityProfile: { isNot: null }
      },
      include: {
        personalityProfile: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true
          }
        }
      },
      take: 10
    })

    // Calculate match scores
    const matches = potentialTwins.map(twin => {
      const score = calculateTwinScore(
        {
          traits: userProfile.personalityProfile.traits,
          interests: userProfile.personalityProfile.interests,
          activity: userProfile._count
        },
        {
          traits: twin.personalityProfile.traits,
          interests: twin.personalityProfile.interests,
          activity: twin._count
        }
      )

      return {
        user: {
          id: twin.id,
          name: twin.name,
          image: twin.image
        },
        score: score.total,
        breakdown: score.breakdown
      }
    })

    // Sort by match score
    matches.sort((a, b) => b.score - a.score)

    return NextResponse.json(matches)
  } catch (error) {
    console.error("Error finding twin matches:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 