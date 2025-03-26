import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { analyzeSocialData } from "@/lib/services/social-analysis"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { platform } = params

    const connection = await prisma.socialConnection.findFirst({
      where: {
        userId: session.user.id,
        platform,
      },
    })

    if (!connection) {
      return new NextResponse("Connection not found", { status: 404 })
    }

    const analysisResults = await analyzeSocialData(connection)

    await prisma.socialAnalysis.upsert({
      where: {
        connectionId: connection.id,
      },
      update: {
        ...analysisResults,
        lastAnalyzed: new Date(),
      },
      create: {
        connectionId: connection.id,
        ...analysisResults,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error analyzing social data:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 