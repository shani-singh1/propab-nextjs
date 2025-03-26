import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generatePersonalityInsights } from "@/lib/personality-insights"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const profile = await prisma.personalityProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile?.traits) {
      return new NextResponse("Personality profile not found", { status: 404 })
    }

    const insights = generatePersonalityInsights(profile.traits)

    return NextResponse.json(insights)
  } catch (error) {
    console.error("Error generating personality insights:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 