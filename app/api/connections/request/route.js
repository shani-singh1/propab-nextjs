import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { targetUserId } = await request.json()

    // Check if connection already exists
    const existingConnection = await prisma.twinConnection.findFirst({
      where: {
        OR: [
          { userId: session.user.id, targetUserId },
          { userId: targetUserId, targetUserId: session.user.id }
        ]
      }
    })

    if (existingConnection) {
      return new Response(
        JSON.stringify({ error: "Connection already exists" }),
        { status: 400 }
      )
    }

    // Calculate compatibility score
    const [userProfile, targetProfile] = await Promise.all([
      prisma.personalityProfile.findUnique({
        where: { userId: session.user.id }
      }),
      prisma.personalityProfile.findUnique({
        where: { userId: targetUserId }
      })
    ])

    const quality = calculateCompatibility(userProfile, targetProfile)

    // Create connection request
    const connection = await prisma.twinConnection.create({
      data: {
        userId: session.user.id,
        targetUserId,
        status: "PENDING",
        quality
      }
    })

    // Create notification for target user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: "CONNECTION_REQUEST",
        title: "New Connection Request",
        message: `${session.user.name} wants to connect with you!`,
        metadata: {
          connectionId: connection.id,
          senderId: session.user.id,
          senderName: session.user.name,
          senderImage: session.user.image,
          compatibilityScore: quality
        }
      }
    })

    return Response.json(connection)
  } catch (error) {
    console.error('Error creating connection request:', error)
    return new Response(
      JSON.stringify({ error: "Failed to create connection request" }),
      { status: 500 }
    )
  }
}

function calculateCompatibility(profile1, profile2) {
  // Reuse the same compatibility calculation from match route
  let score = 0
  
  const traits1 = profile1?.traits || {}
  const traits2 = profile2?.traits || {}
  const traitKeys = new Set([...Object.keys(traits1), ...Object.keys(traits2)])
  
  traitKeys.forEach(trait => {
    const value1 = traits1[trait] || 0
    const value2 = traits2[trait] || 0
    score += (1 - Math.abs(value1 - value2)) * 20
  })

  const interests1 = new Set(profile1?.interests || [])
  const interests2 = new Set(profile2?.interests || [])
  const commonInterests = new Set([...interests1].filter(x => interests2.has(x)))
  score += (commonInterests.size / Math.max(interests1.size, interests2.size)) * 50

  return Math.round(score)
} 