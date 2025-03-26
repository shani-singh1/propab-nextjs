import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get user's profile
    const userProfile = await prisma.personalityProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404 }
      )
    }

    // Find potential matches
    const potentialMatches = await prisma.personalityProfile.findMany({
      where: {
        userId: {
          not: session.user.id,
          notIn: userProfile.blacklist || []
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      take: 5
    })

    // Calculate compatibility scores
    const matches = potentialMatches.map(match => {
      const compatibilityScore = calculateCompatibility(userProfile, match)
      return {
        id: match.user.id,
        name: match.user.name,
        image: match.user.image,
        compatibilityScore
      }
    }).filter(match => match.compatibilityScore > 60) // Only return good matches

    return Response.json({ matches })
  } catch (error) {
    console.error('Error finding matches:', error)
    return new Response(
      JSON.stringify({ error: "Failed to find matches" }),
      { status: 500 }
    )
  }
}

function calculateCompatibility(profile1, profile2) {
  let score = 0
  
  // Calculate trait similarity
  const traits1 = profile1.traits || {}
  const traits2 = profile2.traits || {}
  const traitKeys = new Set([...Object.keys(traits1), ...Object.keys(traits2)])
  
  traitKeys.forEach(trait => {
    const value1 = traits1[trait] || 0
    const value2 = traits2[trait] || 0
    score += (1 - Math.abs(value1 - value2)) * 20 // Max 20 points per trait
  })

  // Calculate interest overlap
  const interests1 = new Set(profile1.interests || [])
  const interests2 = new Set(profile2.interests || [])
  const commonInterests = new Set([...interests1].filter(x => interests2.has(x)))
  score += (commonInterests.size / Math.max(interests1.size, interests2.size)) * 50 // Max 50 points

  return Math.round(score)
} 