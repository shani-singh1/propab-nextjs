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

    const { searchParams } = new URL(req.url)
    const filter = searchParams.get("filter")

    // Get both voice and video calls
    const [voiceCalls, videoCalls] = await Promise.all([
      filter === "all" || filter === "voice"
        ? prisma.voiceChat.findMany({
            where: { userId: session.user.id },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            },
            orderBy: { createdAt: "desc" }
          })
        : [],
      filter === "all" || filter === "video"
        ? prisma.videoChat.findMany({
            where: { userId: session.user.id },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            },
            orderBy: { createdAt: "desc" }
          })
        : []
    ])

    // Combine and format calls
    const calls = [...voiceCalls, ...videoCalls]
      .map(call => ({
        ...call,
        type: "voiceChat" in call ? "voice" : "video"
      }))
      .sort((a, b) => b.createdAt - a.createdAt)

    return NextResponse.json(calls)
  } catch (error) {
    console.error("Error getting call history:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 