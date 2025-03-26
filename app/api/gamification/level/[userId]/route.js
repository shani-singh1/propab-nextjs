import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000]
const TITLES = [
  "Novice",
  "Apprentice",
  "Explorer",
  "Enthusiast",
  "Expert",
  "Master",
  "Guru",
  "Legend",
  "Mythical",
  "Divine"
]

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            likes: true,
            comments: true
          }
        }
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Calculate XP
    const xp = calculateTotalXP(user)
    const currentLevel = calculateLevel(xp)
    const nextLevelXP = LEVEL_THRESHOLDS[currentLevel + 1] || LEVEL_THRESHOLDS[currentLevel]

    // Get available rewards
    const rewards = await getAvailableRewards(user, currentLevel)

    return NextResponse.json({
      currentLevel,
      title: TITLES[currentLevel],
      currentXP: xp,
      nextLevelXP,
      rewards
    })
  } catch (error) {
    console.error("Error getting level data:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

function calculateTotalXP(user) {
  return (
    user._count.posts * 10 +
    user._count.followers * 5 +
    user._count.likes * 2 +
    user._count.comments * 3
  )
}

function calculateLevel(xp) {
  return LEVEL_THRESHOLDS.findIndex((threshold, index, arr) => 
    xp >= threshold && (index === arr.length - 1 || xp < arr[index + 1])
  )
}

async function getAvailableRewards(user, level) {
  // This would typically come from a database
  return [
    {
      id: "custom-badge",
      name: "Custom Profile Badge",
      description: "Unlock a unique badge for your profile",
      canClaim: level >= 3 && !user.hasBadge
    },
    {
      id: "theme-access",
      name: "Custom Theme Access",
      description: "Unlock custom theme options",
      canClaim: level >= 5 && !user.hasCustomTheme
    },
    {
      id: "verified-status",
      name: "Verified Status",
      description: "Get a verified badge on your profile",
      canClaim: level >= 7 && !user.isVerified
    }
  ]
} 