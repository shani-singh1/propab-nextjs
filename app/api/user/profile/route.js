import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updates = await req.json()
    const allowedFields = ["name", "image", "bio", "location"]
    
    // Filter out any fields that aren't allowed
    const validUpdates = Object.entries(updates)
      .filter(([key]) => allowedFields.includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: validUpdates
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating profile:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 