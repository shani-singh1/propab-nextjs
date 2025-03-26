import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { GamificationService } from "@/lib/services/gamification"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const { action, data } = await req.json()

    const gamificationService = new GamificationService(userId)
    const result = await gamificationService.handleAction(action, data)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error handling gamification action:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 