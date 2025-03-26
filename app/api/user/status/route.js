import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        onboardingComplete: true,
        personalityProfile: {
          select: { id: true }
        }
      }
    })

    return NextResponse.json({
      onboardingComplete: user?.onboardingComplete,
      hasPersonality: !!user?.personalityProfile
    })
  } catch (error) {
    console.error('Error fetching user status:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 