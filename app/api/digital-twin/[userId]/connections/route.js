import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get("filter") || "all"

    const whereClause = {
      OR: [
        { userId: userId },
        { targetId: userId }
      ]
    }

    if (filter === "active") {
      whereClause.status = "ACCEPTED"
    } else if (filter === "pending") {
      whereClause.status = "PENDING"
    }

    const connections = await prisma.twinConnection.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            personalityProfile: true
          }
        },
        twin: {
          select: {
            id: true,
            name: true,
            image: true,
            personalityProfile: true
          }
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Transform connections to ensure consistent format
    const transformedConnections = connections.map(conn => ({
      ...conn,
      twin: conn.userId === userId ? conn.twin : conn.user
    }))

    return NextResponse.json(transformedConnections)
  } catch (error) {
    console.error("Error fetching connections:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const { targetUserId, notes } = await req.json()

    // Check if connection already exists
    const existingConnection = await prisma.twinConnection.findFirst({
      where: {
        OR: [
          { userId, targetId: targetUserId },
          { userId: targetUserId, targetId: userId }
        ]
      }
    })

    if (existingConnection) {
      return new NextResponse("Connection already exists", { status: 400 })
    }

    // Create new connection
    const connection = await prisma.twinConnection.create({
      data: {
        userId,
        targetId: targetUserId,
        status: "PENDING",
        notes,
        quality: 0.5, // Initial quality score
        compatibility: await calculateCompatibility(userId, targetUserId),
        engagement: 0,
        synergy: 0
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            personalityProfile: true
          }
        },
        twin: {
          select: {
            id: true,
            name: true,
            image: true,
            personalityProfile: true
          }
        }
      }
    })

    // Create activity records
    await Promise.all([
      createConnectionActivity(userId, "SENT_REQUEST", targetUserId),
      createConnectionActivity(targetUserId, "RECEIVED_REQUEST", userId)
    ])

    // Send real-time notifications
    pusherServer.trigger(`user-${targetUserId}`, 'new_connection', {
      type: 'CONNECTION_REQUEST',
      connection
    })

    return NextResponse.json(connection)
  } catch (error) {
    console.error("Error creating connection:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

async function calculateCompatibility(userId1, userId2) {
  const [profile1, profile2] = await Promise.all([
    prisma.personalityProfile.findUnique({
      where: { userId: userId1 }
    }),
    prisma.personalityProfile.findUnique({
      where: { userId: userId2 }
    })
  ])

  if (!profile1 || !profile2) return 0.5

  // Calculate based on interests overlap
  const interests1 = new Set(profile1.interests)
  const interests2 = new Set(profile2.interests)
  const commonInterests = new Set([...interests1].filter(x => interests2.has(x)))
  
  const interestScore = commonInterests.size / Math.max(interests1.size, interests2.size)

  // Calculate trait compatibility
  const traitScore = Object.keys(profile1.traits).reduce((score, trait) => {
    const diff = Math.abs((profile1.traits[trait] || 0.5) - (profile2.traits[trait] || 0.5))
    return score + (1 - diff)
  }, 0) / Object.keys(profile1.traits).length

  return (interestScore * 0.6 + traitScore * 0.4)
}

async function createConnectionActivity(userId, type, targetUserId) {
  return prisma.activity.create({
    data: {
      userId,
      type,
      metadata: {
        create: {
          targetUserId
        }
      }
    }
  })
} 