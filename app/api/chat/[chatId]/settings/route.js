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

    const { chatId } = params

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userIds: {
          has: session.user.id
        }
      },
      select: {
        settings: true
      }
    })

    if (!chat) {
      return new NextResponse("Not found", { status: 404 })
    }

    return NextResponse.json(chat.settings || {})
  } catch (error) {
    console.error("Error getting chat settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { chatId } = params
    const updates = await req.json()

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userIds: {
          has: session.user.id
        }
      }
    })

    if (!chat) {
      return new NextResponse("Not found", { status: 404 })
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        settings: {
          ...(chat.settings || {}),
          ...updates
        }
      }
    })

    return NextResponse.json(updatedChat.settings)
  } catch (error) {
    console.error("Error updating chat settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 