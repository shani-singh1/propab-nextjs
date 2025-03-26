import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await req.json()

    // Update user and create personality profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingComplete: true,
        personalityProfile: {
          create: {
            traits: data.personality || {},
            interests: data.interests || []
          }
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 