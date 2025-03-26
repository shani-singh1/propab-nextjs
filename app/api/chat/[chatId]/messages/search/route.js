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
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")

    if (!query) {
      return new NextResponse("Search query required", { status: 400 })
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId,
        content: {
          contains: query,
          mode: "insensitive"
        },
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
        createdAt: "desc"
      },
      take: 20
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error searching messages:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 