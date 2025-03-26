import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userProfile = await prisma.personalityProfile.findUnique({
      where: { userId: session.user.id },
      include: { interests: true }
    })

    if (!userProfile) {
      return new NextResponse("Profile not found", { status: 404 })
    }

    // Find users with similar interests and traits
    const recommendations = await prisma.user.findMany({
      where: {
        NOT: { id: session.user.id },
        personalityProfile: {
          interests: {
            hasSome: userProfile.interests
          }
        }
      },
      include: {
        personalityProfile: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      },
      take: 5
    })

    // Calculate match scores and format response
    const recommendationsWithScores = recommendations.map(user => {
      const matchScore = calculateMatchScore(
        userProfile,
        user.personalityProfile,
        user._count
      )

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        matchScore: Math.round(matchScore * 100)
      }
    })

    // Sort by match score
    recommendationsWithScores.sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json(recommendationsWithScores)
  } catch (error) {
    console.error("Error getting recommendations:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

function calculateMatchScore(userProfile, otherProfile, activityCount) {
  // Trait similarity (50% weight)
  const traitSimilarity = calculateSimilarity(userProfile.traits, otherProfile.traits)

  // Interest overlap (30% weight)
  const interestOverlap = userProfile.interests.filter(interest => 
    otherProfile.interests.includes(interest)
  ).length / userProfile.interests.length

  // Activity level (20% weight)
  const activityScore = Math.min(
    (activityCount.posts + activityCount.followers) / 100,
    1
  )

  return (
    traitSimilarity * 0.5 +
    interestOverlap * 0.3 +
    activityScore * 0.2
  )
}

function calculateSimilarity(traits1, traits2) {
  const keys = Object.keys(traits1)
  let sum = 0

  keys.forEach(key => {
    const diff = traits1[key] - (traits2[key] || 0)
    sum += diff * diff
  })

  return 1 - Math.sqrt(sum / keys.length)
} 