import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { calculateTwinScore } from "@/lib/twin-matching"
import { NotificationService } from "@/lib/notification-service"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { twinId } = await req.json()

    // Calculate match score
    const [userProfile, twinProfile] = await Promise.all([
      prisma.user.findUnique({
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
      }),
      prisma.user.findUnique({
        where: { id: twinId },
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
    ])

    const score = calculateTwinScore(
      {
        traits: userProfile.personalityProfile.traits,
        interests: userProfile.personalityProfile.interests,
        activity: userProfile._count
      },
      {
        traits: twinProfile.personalityProfile.traits,
        interests: twinProfile.personalityProfile.interests,
        activity: twinProfile._count
      }
    )

    // Create connection request
    const connection = await prisma.twinConnection.create({
      data: {
        userId: session.user.id,
        twinId,
        status: "PENDING",
        matchScore: score.total,
        scoreBreakdown: score.breakdown
      },
      include: {
        user: true
      }
    })

    // Send notification to potential twin
    await NotificationService.notifyTwinRequest(
      twinId,
      session.user.name,
      score.total
    )

    return NextResponse.json(connection)
  } catch (error) {
    console.error("Error creating twin connection:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 