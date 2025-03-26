import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: [
        { completed: 'asc' },
        { progress: 'desc' }
      ]
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error("Error getting achievements:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params
    const data = await req.json()

    const achievement = await prisma.achievement.create({
      data: {
        userId,
        type: data.type,
        name: data.name,
        description: data.description,
        progress: data.progress || 0
      }
    })

    return NextResponse.json(achievement)
  } catch (error) {
    console.error("Error creating achievement:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 