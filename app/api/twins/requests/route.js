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

    // Get pending connection requests sent to the user
    const requests = await prisma.twinConnection.findMany({
      where: {
        twinId: session.user.id,
        status: "PENDING"
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
      }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error getting connection requests:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 