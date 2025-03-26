import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendNotification } from "@/lib/send-notification"

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { rewardId } = params

    // Process reward claim
    // ... existing reward claim logic ...

    // Send notification
    await sendNotification({
      userId: session.user.id,
      type: "REWARD",
      title: "Reward Claimed!",
      message: `You've successfully claimed the ${reward.name} reward.`
    })

    return NextResponse.json(reward)
  } catch (error) {
    console.error("Error claiming reward:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 