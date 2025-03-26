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
      select: { notificationPreferences: true }
    })

    return NextResponse.json(user?.notificationPreferences ?? {})
  } catch (error) {
    console.error("Error getting notification preferences:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { type, enabled } = await req.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationPreferences: {
          [type]: enabled
        }
      }
    })

    return NextResponse.json(user.notificationPreferences)
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 