import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { subDays, format } from "date-fns"
import { Users, Trophy, Sparkles, Brain } from "lucide-react"

const CATEGORY_ICONS = {
  SOCIAL: Users,
  ACHIEVEMENT: Trophy,
  LEVEL_UP: Sparkles,
  INSIGHT: Brain,
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const thirtyDaysAgo = subDays(new Date(), 30)

    // Get all notifications for the user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Calculate total and read notifications
    const totalNotifications = notifications.length
    const readNotifications = notifications.filter(n => n.read).length

    // Group notifications by category
    const categoryCount = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1
      return acc
    }, {})

    // Format data for chart
    const byCategory = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count
    }))

    // Get recent activity
    const recentActivity = notifications.slice(0, 5).map(n => ({
      icon: CATEGORY_ICONS[n.type] || Bell,
      description: n.title,
      time: format(new Date(n.createdAt), "MMM d, h:mm a")
    }))

    return NextResponse.json({
      totalNotifications,
      averagePerDay: Math.round(totalNotifications / 30),
      readRate: Math.round((readNotifications / totalNotifications) * 100) || 0,
      byCategory,
      recentActivity
    })
  } catch (error) {
    console.error("Error getting notification analytics:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 