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

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        metadata: true
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activities:", error)
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
    const data = await req.json()

    const activity = await prisma.activity.create({
      data: {
        userId,
        ...data
      }
    })

    // Trigger real-time update
    pusherServer.trigger(`user-${userId}`, 'new_activity', activity)

    return NextResponse.json(activity)
  } catch (error) {
    console.error("Error creating activity:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 