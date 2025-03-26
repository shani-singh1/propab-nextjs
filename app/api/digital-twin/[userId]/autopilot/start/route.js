import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { AutopilotService } from "@/lib/services/autopilot-service"
import prisma from "@/lib/prisma"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const settings = await req.json()

    // Create autopilot session
    const autopilotSession = await prisma.autopilotSession.create({
      data: {
        userId,
        settings,
        status: "RUNNING"
      }
    })

    // Start autopilot process
    const autopilotService = new AutopilotService(userId)
    autopilotService.start(settings, autopilotSession.id)

    return NextResponse.json({ sessionId: autopilotSession.id })
  } catch (error) {
    console.error("Error starting autopilot:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 