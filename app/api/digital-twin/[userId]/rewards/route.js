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
    const rewards = await prisma.reward.findMany({
      where: {
        userId,
        OR: [
          { claimed: false },
          { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Show last 7 days of claimed rewards
        ]
      },
      orderBy: [
        { claimed: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(rewards)
  } catch (error) {
    console.error("Error getting rewards:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 