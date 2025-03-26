import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { TimelineSuggestionService } from "@/lib/services/timeline-suggestion"
import prisma from "@/lib/prisma"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const memoryId = searchParams.get("memoryId")

    const memory = await prisma.memory.findUnique({
      where: { id: memoryId }
    })

    if (!memory) {
      return new NextResponse("Memory not found", { status: 404 })
    }

    const suggestionService = new TimelineSuggestionService(session.user.id)
    const suggestions = await suggestionService.generateSuggestions(memory)

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 