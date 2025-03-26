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

    const [
      twinConnections,
      messageCount,
      personalityProfile,
      totalMatches
    ] = await Promise.all([
      // Get twin connections
      prisma.twinConnection.count({
        where: {
          OR: [
            { userId: session.user.id },
            { twinId: session.user.id }
          ],
          status: "ACCEPTED"
        }
      }),

      // Get total messages
      prisma.message.count({
        where: {
          userId: session.user.id
        }
      }),

      // Get personality profile
      prisma.personalityProfile.findUnique({
        where: { userId: session.user.id }
      }),

      // Get match quality
      prisma.twinConnection.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            { twinId: session.user.id }
          ],
          status: "ACCEPTED"
        },
        select: {
          matchScore: true
        }
      })
    ])

    // Calculate profile completion score
    const profileScore = calculateProfileScore(personalityProfile)

    // Calculate average match quality
    const matchQuality = totalMatches.length > 0
      ? Math.round(
          totalMatches.reduce((acc, curr) => acc + curr.matchScore, 0) / 
          totalMatches.length
        )
      : 0

    return NextResponse.json({
      twinCount: twinConnections,
      messageCount,
      profileScore,
      matchQuality
    })
  } catch (error) {
    console.error("Error getting user stats:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

function calculateProfileScore(profile) {
  if (!profile) return 0

  const scores = {
    traits: profile.traits ? 40 : 0,
    interests: profile.interests ? 30 : 0,
    socialConnections: profile.socialConnections ? 30 : 0
  }

  return Object.values(scores).reduce((a, b) => a + b, 0)
} 