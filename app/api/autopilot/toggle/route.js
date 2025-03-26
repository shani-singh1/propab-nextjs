import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { active } = await request.json()

    if (active) {
      // Start new autopilot session
      await prisma.autopilotSession.create({
        data: {
          userId: session.user.id,
          status: "ACTIVE",
          activities: {
            create: {
              userId: session.user.id,
              type: "INITIALIZING",
              status: "IN_PROGRESS"
            }
          }
        }
      })
    } else {
      // End active sessions
      await prisma.autopilotSession.updateMany({
        where: {
          userId: session.user.id,
          status: "ACTIVE"
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date()
        }
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error toggling autopilot:', error)
    return new Response(
      JSON.stringify({ error: "Failed to toggle autopilot" }),
      { status: 500 }
    )
  }
} 