import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { traits } = await req.json()

    // Convert trait values from strings to numbers
    const normalizedTraits = Object.fromEntries(
      Object.entries(traits).map(([key, value]) => [key, parseFloat(value)])
    )

    await prisma.personalityProfile.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        traits: normalizedTraits
      },
      create: {
        userId: session.user.id,
        traits: normalizedTraits
      }
    })

    return new NextResponse("OK")
  } catch (error) {
    console.error("Error saving personality traits:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 