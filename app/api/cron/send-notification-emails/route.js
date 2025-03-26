import { NextResponse } from "next/server"
import { NotificationService } from "@/lib/notification-service"

export const runtime = "edge"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await NotificationService.sendGroupedEmails()
    return new NextResponse("OK")
  } catch (error) {
    console.error("Error sending notification emails:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 