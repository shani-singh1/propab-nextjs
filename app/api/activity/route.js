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

    // Get various types of activities
    const [connections, messages, profileUpdates] = await Promise.all([
      // Get twin connection activities
      prisma.twinConnection.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            { twinId: session.user.id }
          ],
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
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
          twin: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }),

      // Get recent messages
      prisma.message.findMany({
        where: {
          chat: {
            userIds: {
              has: session.user.id
            }
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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
        orderBy: {
          createdAt: "desc"
        },
        take: 10
      }),

      // Get profile updates
      prisma.personalityProfile.findMany({
        where: {
          userId: session.user.id,
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          updatedAt: "desc"
        }
      })
    ])

    // Transform and combine activities
    const activities = [
      ...connections.map(conn => ({
        id: `conn_${conn.id}`,
        type: conn.status === "PENDING" ? "TWIN_REQUEST" : "TWIN_ACCEPT",
        title: conn.status === "PENDING" ? "New Twin Request" : "Twin Connection Accepted",
        description: conn.status === "PENDING"
          ? `${conn.user.name} wants to connect`
          : `You're now connected with ${conn.twin.name}`,
        createdAt: conn.createdAt,
        relatedUser: conn.userId === session.user.id ? conn.twin : conn.user
      })),

      ...messages.map(msg => ({
        id: `msg_${msg.id}`,
        type: "MESSAGE",
        title: "New Message",
        description: msg.content.slice(0, 50) + (msg.content.length > 50 ? "..." : ""),
        createdAt: msg.createdAt,
        relatedUser: msg.user
      })),

      ...profileUpdates.map(update => ({
        id: `prof_${update.id}`,
        type: "PERSONALITY_UPDATE",
        title: "Profile Updated",
        description: "Your personality profile was updated",
        createdAt: update.updatedAt
      }))
    ]

    // Sort by date
    activities.sort((a, b) => b.createdAt - a.createdAt)

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error getting activity feed:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 