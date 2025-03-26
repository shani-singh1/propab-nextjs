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

    const { userId } = params
    const { searchParams } = new URL(req.url)
    const timelineId = searchParams.get("timelineId")

    const timeline = await prisma.alternateTimeline.findUnique({
      where: { id: timelineId }
    })

    if (!timeline) {
      return new NextResponse("Timeline not found", { status: 404 })
    }

    // Find timelines with similar topics or variables
    const relatedTimelines = await prisma.alternateTimeline.findMany({
      where: {
        userId,
        id: { not: timelineId },
        OR: [
          {
            baseMemoryId: timeline.baseMemoryId
          },
          {
            variables: {
              path: Object.keys(timeline.variables)[0],
              not: undefined
            }
          }
        ]
      },
      take: 3,
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(relatedTimelines)
  } catch (error) {
    console.error("Error getting related timelines:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 