import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { platform } = params

    // Delete the social connection
    await prisma.socialConnection.deleteMany({
      where: {
        userId: session.user.id,
        platform: platform,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting platform:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 