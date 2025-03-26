import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get total connections
    const totalConnections = await prisma.twinConnection.count({
      where: {
        OR: [
          { userId: session.user.id, status: "ACCEPTED" },
          { targetUserId: session.user.id, status: "ACCEPTED" }
        ]
      }
    })

    // Get pending requests
    const pendingRequests = await prisma.twinConnection.count({
      where: {
        targetUserId: session.user.id,
        status: "PENDING"
      }
    })

    // Calculate average compatibility score
    const connections = await prisma.twinConnection.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { targetUserId: session.user.id }
        ]
      },
      select: {
        quality: true
      }
    })

    const avgCompatibility = connections.length > 0
      ? Math.round(connections.reduce((acc, curr) => acc + (curr.quality || 0), 0) / connections.length)
      : 0

    return Response.json({
      totalConnections,
      pendingRequests,
      compatibilityScore: avgCompatibility
    })
  } catch (error) {
    console.error('Error fetching connection stats:', error)
    return new Response(
      JSON.stringify({ error: "Failed to fetch connection stats" }),
      { status: 500 }
    )
  }
} 