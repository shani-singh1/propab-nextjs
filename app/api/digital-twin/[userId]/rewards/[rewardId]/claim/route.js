import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId, rewardId } = params

    // Get the reward
    const reward = await prisma.reward.findFirst({
      where: {
        id: rewardId,
        userId,
        claimed: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })

    if (!reward) {
      return new NextResponse("Reward not found or already claimed", { status: 404 })
    }

    // Start a transaction to claim reward and apply effects
    const result = await prisma.$transaction(async (tx) => {
      // Mark reward as claimed
      const claimedReward = await tx.reward.update({
        where: { id: rewardId },
        data: {
          claimed: true,
          claimedAt: new Date()
        }
      })

      // Apply reward effects
      switch (claimedReward.type) {
        case "XP_BOOST":
          await tx.user.update({
            where: { id: userId },
            data: {
              experience: {
                increment: claimedReward.value
              }
            }
          })
          break

        case "THEME_UNLOCK":
          // Implement theme unlocking logic
          break

        case "FEATURE_UNLOCK":
          // Implement feature unlocking logic
          break
      }

      return claimedReward
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error claiming reward:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 