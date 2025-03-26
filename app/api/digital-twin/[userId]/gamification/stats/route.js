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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        experience: true
      }
    })

    // Calculate next level XP requirement
    const nextLevelXP = Math.round(1000 * Math.pow(1.2, user.level - 1))

    return NextResponse.json({
      level: user.level,
      experience: user.experience,
      nextLevelXP
    })
  } catch (error) {
    console.error("Error getting gamification stats:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 