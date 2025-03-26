import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { messageId } = params
    const { content } = await req.json()

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true }
    })

    if (!message || !message.chat.userIds.includes(session.user.id)) {
      return new NextResponse("Not found", { status: 404 })
    }

    if (message.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error("Error updating message:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { messageId } = params

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true }
    })

    if (!message || !message.chat.userIds.includes(session.user.id)) {
      return new NextResponse("Not found", { status: 404 })
    }

    if (message.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    await prisma.message.delete({
      where: { id: messageId }
    })

    return new NextResponse("OK")
  } catch (error) {
    console.error("Error deleting message:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 