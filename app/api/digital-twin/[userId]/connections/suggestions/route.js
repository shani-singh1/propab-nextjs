import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { ConnectionAIService } from "@/lib/services/connection-ai"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const connectionService = new ConnectionAIService(userId)
    const suggestions = await connectionService.findPotentialConnections()

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Error getting connection suggestions:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 