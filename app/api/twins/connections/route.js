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

    // Get all accepted connections where user is either the requester or receiver
    const connections = await prisma.twinConnection.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { twinId: session.user.id }
        ],
        status: "ACCEPTED"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        twin: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    return NextResponse.json(connections)
  } catch (error) {
    console.error("Error getting connections:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 