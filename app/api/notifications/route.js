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
    const search = searchParams.get("search")
    const categories = searchParams.get("categories")?.split(",")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { message: { contains: search, mode: "insensitive" } }
        ]
      }),
      ...(categories?.length && {
        type: { in: categories }
      }),
      ...(from && {
        createdAt: {
          gte: new Date(from),
          ...(to && { lte: new Date(to) })
        }
      })
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error getting notifications:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { type, title, message } = await req.json()

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId: session.user.id
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error creating notification:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 