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

    const [user, connections, achievements, timelines] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId }
      }),
      prisma.twinConnection.count({
        where: { userId }
      }),
      prisma.achievement.count({
        where: { userId }
      }),
      prisma.alternateTimeline.count({
        where: { userId }
      })
    ])

    return NextResponse.json({
      level: user.level,
      experience: user.experience,
      nextLevelXP: calculateNextLevelXP(user.level),
      connections,
      achievements,
      timelines,
      rating: calculateUserRating(user)
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

function calculateNextLevelXP(currentLevel) {
  return Math.floor(1000 * Math.pow(1.2, currentLevel - 1))
}

function calculateUserRating(user) {
  // Implement rating calculation based on various factors
  return 85 // Placeholder
} 