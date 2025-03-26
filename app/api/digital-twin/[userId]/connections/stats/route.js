import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params

    // Get new connections in the last 7 days
    const lastWeekStart = startOfWeek(subWeeks(new Date(), 1))
    const newConnections = await prisma.twinConnection.count({
      where: {
        userId,
        createdAt: {
          gte: lastWeekStart
        }
      }
    })

    // Calculate engagement rate
    const [totalInteractions, totalConnections] = await Promise.all([
      prisma.interaction.count({
        where: {
          userId,
          createdAt: {
            gte: subWeeks(new Date(), 4)
          }
        }
      }),
      prisma.twinConnection.count({
        where: { userId }
      })
    ])

    const engagementRate = totalConnections > 0
      ? Math.round((totalInteractions / totalConnections / 4) * 100)
      : 0

    // Get growth data for the last 8 weeks
    const growthData = await generateGrowthData(userId)

    // Get quality metrics
    const qualityMetrics = await calculateQualityMetrics(userId)

    return NextResponse.json({
      newConnections,
      engagementRate,
      growthData,
      qualityMetrics
    })
  } catch (error) {
    console.error("Error fetching connection stats:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

async function generateGrowthData(userId) {
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i))
    const weekEnd = endOfWeek(weekStart)
    
    const connections = await prisma.twinConnection.count({
      where: {
        userId,
        createdAt: {
          lte: weekEnd
        }
      }
    })

    weeks.push({
      date: format(weekStart, 'MMM d'),
      connections
    })
  }

  return weeks
}

async function calculateQualityMetrics(userId) {
  const connections = await prisma.twinConnection.findMany({
    where: { userId },
    select: { quality: true }
  })

  const metrics = [
    {
      name: "High Quality",
      value: Math.round(
        (connections.filter(c => c.quality >= 0.8).length / connections.length) * 100
      )
    },
    {
      name: "Active Engagement",
      value: Math.round(
        (connections.filter(c => c.quality >= 0.6).length / connections.length) * 100
      )
    },
    {
      name: "Growth Potential",
      value: Math.round(
        (connections.filter(c => c.quality >= 0.4).length / connections.length) * 100
      )
    }
  ]

  return metrics
} 