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

    const { messageId } = params
    const { emoji } = await req.json()

    // Toggle reaction (add if doesn't exist, remove if exists)
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId: session.user.id,
        emoji
      }
    })

    if (existingReaction) {
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id }
      })
      return NextResponse.json({ removed: true })
    }

    const reaction = await prisma.messageReaction.create({
      data: {
        emoji,
        message: { connect: { id: messageId } },
        user: { connect: { id: session.user.id } }
      },
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

    return NextResponse.json(reaction)
  } catch (error) {
    console.error("Error handling reaction:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 