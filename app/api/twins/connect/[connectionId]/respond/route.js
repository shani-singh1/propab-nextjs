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

    const { connectionId } = params
    const { status } = await req.json()

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 })
    }

    const connection = await prisma.twinConnection.update({
      where: {
        id: connectionId,
        twinId: session.user.id,
        status: "PENDING"
      },
      data: { status },
      include: {
        user: true,
        twin: true
      }
    })

    // Send notification to the requester
    if (status === "ACCEPTED") {
      await NotificationService.notifyTwinRequestAccepted(
        connection.userId,
        session.user.name
      )
    }

    return NextResponse.json(connection)
  } catch (error) {
    console.error("Error responding to twin connection:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 