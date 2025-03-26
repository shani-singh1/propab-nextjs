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

    // Get current user's profile
    const userProfile = await prisma.personalityProfile.findUnique({
      where: { userId: session.user.id },
      include: { interests: true }
    })

    if (!userProfile) {
      return new NextResponse("Profile not found", { status: 404 })
    }

    // Find similar users
    const similarUsers = await prisma.personalityProfile.findMany({
      where: {
        NOT: { userId: session.user.id },
        interests: {
          hasSome: userProfile.interests
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        interests: true
      }
    })

    // Calculate similarity scores
    const similarityScores = similarUsers.map(profile => {
      const score = calculateSimilarity(userProfile.traits, profile.traits)
      const commonInterests = profile.interests.filter(interest => 
        userProfile.interests.includes(interest)
      )

      return {
        user: profile.user,
        traits: profile.traits,
        similarity: Math.round(score * 100),
        commonInterests
      }
    })

    // Sort by similarity and return the most similar user
    const mostSimilar = similarityScores.sort((a, b) => b.similarity - a.similarity)[0]

    return NextResponse.json(mostSimilar)
  } catch (error) {
    console.error("Error finding similar users:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
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