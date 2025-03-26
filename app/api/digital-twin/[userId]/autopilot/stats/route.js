import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params

    // Get autopilot stats
    const [
      connections,
      recentConnections,
      previousPeriodConnections,
      recentActivity
    ] = await Promise.all([
      // Total connections made by autopilot
      prisma.twinConnection.count({
        where: {
          userId,
          createdBy: "AUTOPILOT"
        }
      }),
      // Recent connections for trend calculation
      prisma.twinConnection.findMany({
        where: {
          userId,
          createdBy: "AUTOPILOT",
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        include: {
          twin: true
        }
      }),
      // Previous period connections for trend
      prisma.twinConnection.count({
        where: {
          userId,
          createdBy: "AUTOPILOT",
          createdAt: {
            gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // Recent activity
      prisma.autopilotActivity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ])

    // Calculate trends and stats
    const avgCompatibility = recentConnections.reduce(
      (sum, conn) => sum + conn.compatibility,
      0
    ) / Math.max(recentConnections.length, 1)

    const connectionsTrend = calculateTrend(
      recentConnections.length,
      previousPeriodConnections
    )

    return NextResponse.json({
      connectionsCount: connections,
      connectionsTrend,
      avgCompatibility,
      compatibilityTrend: 0.05, // Placeholder
      responseRate: 0.75, // Placeholder
      responseTrend: 0.02, // Placeholder
      recentActivity: recentActivity.map(activity => ({
        type: activity.type,
        message: activity.message,
        timestamp: activity.createdAt
      }))
    })
  } catch (error) {
    console.error("Error getting autopilot stats:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

function calculateTrend(current, previous) {
  if (!previous) return 0
  return ((current - previous) / previous) * 100
} 