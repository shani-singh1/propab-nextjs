import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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
        followers: true,
        following: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            likes: true,
            comments: true
          }
        }
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Calculate achievements
    const achievements = {
      totalPoints: 0,
      items: [
        {
          type: "INFLUENCER",
          name: "Influencer",
          description: "Gain followers",
          target: 100,
          progress: user._count.followers,
          points: 50,
          completed: user._count.followers >= 100
        },
        {
          type: "CREATOR",
          name: "Content Creator",
          description: "Create posts",
          target: 50,
          progress: user._count.posts,
          points: 30,
          completed: user._count.posts >= 50
        },
        {
          type: "ENGAGER",
          name: "Community Engager",
          description: "Like and comment on posts",
          target: 200,
          progress: user._count.likes + user._count.comments,
          points: 40,
          completed: (user._count.likes + user._count.comments) >= 200
        },
        {
          type: "CONSISTENT",
          name: "Consistency King",
          description: "Post regularly",
          target: 30,
          progress: calculateConsistencyStreak(user.posts),
          points: 60,
          completed: calculateConsistencyStreak(user.posts) >= 30
        },
        {
          type: "POPULAR",
          name: "Popular Posts",
          description: "Get likes on your posts",
          target: 1000,
          progress: calculateTotalLikes(user.posts),
          points: 70,
          completed: calculateTotalLikes(user.posts) >= 1000
        }
      ]
    }

    // Calculate total points
    achievements.totalPoints = achievements.items
      .filter(a => a.completed)
      .reduce((sum, a) => sum + a.points, 0)

    return NextResponse.json(achievements)
  } catch (error) {
    console.error("Error getting achievements:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

function calculateConsistencyStreak(posts) {
  // Implementation of streak calculation
  // This is a simplified version
  return posts.length
}

function calculateTotalLikes(posts) {
  return posts.reduce((sum, post) => sum + post._count?.likes || 0, 0)
} 