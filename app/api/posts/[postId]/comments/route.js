import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { NotificationService } from "@/lib/notification-service"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { postId } = params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 10

    const comments = await prisma.comment.findMany({
      where: { postId },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: true
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { postId } = params
    const { content } = await req.json()

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    })

    if (!post) {
      return new NextResponse("Post not found", { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        postId
      },
      include: {
        author: true
      }
    })

    // Send notification to post author
    if (post.authorId !== session.user.id) {
      const postPreview = post.content.slice(0, 50) + (post.content.length > 50 ? "..." : "")
      await NotificationService.notifyNewComment(
        post.authorId,
        session.user.name,
        postPreview
      )
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 