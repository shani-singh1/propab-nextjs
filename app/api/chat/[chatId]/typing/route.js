import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { ChatService } from "@/lib/chat-service"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { chatId } = params
    const { isTyping } = await req.json()

    ChatService.sendTypingStatus(session.user.id, chatId, isTyping)

    return new NextResponse("OK")
  } catch (error) {
    console.error("Error updating typing status:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 