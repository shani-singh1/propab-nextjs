import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { postId } = params

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        likes: {
          increment: 1
        }
      }
    })

    return Response.json(post)
  } catch (error) {
    console.error('Error liking post:', error)
    return new Response(
      JSON.stringify({ error: "Failed to like post" }),
      { status: 500 }
    )
  }
} 