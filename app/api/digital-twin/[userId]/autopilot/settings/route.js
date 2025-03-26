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
    const settings = await prisma.autopilotSettings.findUnique({
      where: { userId }
    })

    return NextResponse.json(settings || {
      maxConnections: 5,
      minCompatibility: 0.7,
      autoMessage: true,
      focusAreas: ["skills", "interests", "goals"],
      activeHours: {
        start: "09:00",
        end: "17:00"
      }
    })
  } catch (error) {
    console.error("Error getting autopilot settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const data = await req.json()

    const settings = await prisma.autopilotSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...data
      },
      update: data
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating autopilot settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 