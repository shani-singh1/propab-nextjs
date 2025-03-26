import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { notificationId } = params

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id
      },
      data: {
        read: true
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 