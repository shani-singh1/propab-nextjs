import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { emitEvent } from "@/lib/emit-event"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 10

    const posts = await prisma.post.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        author: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { content } = await request.json()

    if (!content?.trim()) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        content: content.trim()
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    })

    return Response.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return new Response(
      JSON.stringify({ error: "Failed to create post" }),
      { status: 500 }
    )
  }
} 