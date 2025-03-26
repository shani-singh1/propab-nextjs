import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const requests = await prisma.twinConnection.findMany({
      where: {
        targetUserId: session.user.id,
        status: "PENDING"
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return Response.json(requests)
  } catch (error) {
    console.error('Error fetching connection requests:', error)
    return new Response(
      JSON.stringify({ error: "Failed to fetch requests" }),
      { status: 500 }
    )
  }
} 