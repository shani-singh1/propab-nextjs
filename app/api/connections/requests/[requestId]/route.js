import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { requestId } = params
    const { action } = await request.json()

    const connectionRequest = await prisma.twinConnection.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    if (!connectionRequest || connectionRequest.targetUserId !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Request not found" }),
        { status: 404 }
      )
    }

    if (action === 'accept') {
      await prisma.twinConnection.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" }
      })

      // Create notification for sender
      await prisma.notification.create({
        data: {
          userId: connectionRequest.userId,
          type: "CONNECTION_ACCEPTED",
          title: "Connection Accepted",
          message: `${session.user.name} accepted your connection request!`,
          metadata: {
            connectionId: requestId,
            acceptorId: session.user.id,
            acceptorName: session.user.name,
            acceptorImage: session.user.image
          }
        }
      })
    } else {
      await prisma.twinConnection.update({
        where: { id: requestId },
        data: { status: "DECLINED" }
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error handling connection request:', error)
    return new Response(
      JSON.stringify({ error: "Failed to handle request" }),
      { status: 500 }
    )
  }
} 