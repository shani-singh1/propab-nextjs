import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId, connectionId } = params

    const connection = await prisma.twinConnection.findUnique({
      where: { id: connectionId },
      include: {
        user: true,
        twin: true
      }
    })

    if (!connection) {
      return new NextResponse("Connection not found", { status: 404 })
    }

    if (connection.targetId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updatedConnection = await prisma.twinConnection.update({
      where: { id: connectionId },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date()
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
      createConnectionActivity(userId, "ACCEPTED_REQUEST", connection.userId),
      createConnectionActivity(connection.userId, "REQUEST_ACCEPTED", userId)
    ])

    // Send real-time notifications
    pusherServer.trigger(`user-${connection.userId}`, 'connection_update', {
      type: 'CONNECTION_ACCEPTED',
      connection: updatedConnection
    })

    return NextResponse.json(updatedConnection)
  } catch (error) {
    console.error("Error accepting connection:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
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