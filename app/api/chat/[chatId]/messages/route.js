import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { NotificationService } from "@/lib/notification-service"
import { ChatService } from "@/lib/chat-service"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { chatId } = params

    const messages = await prisma.message.findMany({
      where: {
        chatId,
        chat: {
          userIds: {
            has: session.user.id
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    // Mark unread messages as read
    const unreadMessages = await prisma.message.updateMany({
      where: {
        chatId,
        userId: {
          not: session.user.id
        },
        read: false
      },
      data: {
        read: true
      }
    })

    // Send read receipts for newly read messages
    if (unreadMessages.count > 0) {
      const messages = await prisma.message.findMany({
        where: {
          chatId,
          userId: {
            not: session.user.id
          },
          read: true
        }
      })
      
      messages.forEach(message => {
        ChatService.sendReadReceipt(session.user.id, chatId, message.id)
      })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error getting messages:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { chatId } = params
    const { content } = await req.json()

    const message = await prisma.message.create({
      data: {
        content,
        chat: { connect: { id: chatId } },
        user: { connect: { id: session.user.id } }
      },
      include: {
        user: true,
        chat: {
          include: {
            users: true
          }
        }
      }
    })

    // Send notification to other user in chat
    const otherUser = message.chat.users.find(u => u.id !== session.user.id)
    if (otherUser) {
      await NotificationService.notifyNewMessage(
        otherUser.id,
        session.user.name,
        content.slice(0, 50) + (content.length > 50 ? "..." : "")
      )
    }

    // Update chat's updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 