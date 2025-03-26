import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { NotificationService } from "@/lib/notification-service"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params

    if (session.user.id === userId) {
      return new NextResponse("Cannot follow yourself", { status: 400 })
    }

    const follow = await prisma.follows.create({
      data: {
        followerId: session.user.id,
        followingId: userId,
      },
    })

    // Send notification to followed user
    await NotificationService.notifyNewFollower(
      userId,
      session.user.name
    )

    return new NextResponse("OK")
  } catch (error) {
    console.error('Error following user:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params

    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    })

    return new NextResponse("OK")
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 