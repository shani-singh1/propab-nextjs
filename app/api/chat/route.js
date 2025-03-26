import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const chats = await prisma.chat.findMany({
      where: {
        userIds: {
          has: session.user.id
        }
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    return NextResponse.json(chats)
  } catch (error) {
    console.error("Error getting chats:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = await req.json()

    // Check if chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          { userIds: { has: session.user.id } },
          { userIds: { has: userId } }
        ]
      }
    })

    if (existingChat) {
      return NextResponse.json(existingChat)
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        users: {
          connect: [
            { id: session.user.id },
            { id: userId }
          ]
        },
        userIds: [session.user.id, userId]
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error("Error creating chat:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 