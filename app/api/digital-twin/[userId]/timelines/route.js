import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { MultiverseService } from "@/lib/services/multiverse-service"
import prisma from "@/lib/prisma"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const timelines = await prisma.alternateTimeline.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(timelines)
  } catch (error) {
    console.error("Error getting timelines:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const { memoryId, variables } = await req.json()

    const multiverseService = new MultiverseService(userId)
    const timeline = await multiverseService.generateAlternateTimeline(
      memoryId,
      variables
    )

    return NextResponse.json(timeline)
  } catch (error) {
    console.error("Error creating timeline:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 