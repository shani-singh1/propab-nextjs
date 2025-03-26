import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const activeSession = await prisma.autopilotSession.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        activities: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    return Response.json({
      isActive: !!activeSession,
      currentActivity: activeSession?.activities[0]?.type || null
    })
  } catch (error) {
    console.error('Error checking autopilot status:', error)
    return new Response(
      JSON.stringify({ error: "Failed to check autopilot status" }),
      { status: 500 }
    )
  }
} 