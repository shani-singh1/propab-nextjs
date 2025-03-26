import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { subDays, format } from "date-fns"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { userId } = params

    // Get user's activity data for the last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30)

    const [posts, interactions, profile] = await Promise.all([
      prisma.post.findMany({
        where: {
          authorId: userId,
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      prisma.interaction.findMany({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      prisma.personalityProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              _count: {
                select: {
                  posts: true,
                  followers: true,
                  following: true
                }
              }
            }
          }
        }
      })
    ])

    // Generate timeline data
    const timeline = generateTimeline(posts, interactions)

    // Calculate activity stats
    const stats = [
      {
        label: "Total Posts",
        value: profile.user._count.posts
      },
      {
        label: "Avg. Interactions",
        value: Math.round(interactions.length / 30)
      },
      {
        label: "Engagement Rate",
        value: `${Math.round((interactions.length / posts.length) * 100)}%`
      }
    ]

    // Generate insights
    const insights = generateInsights(posts, interactions, profile)

    return NextResponse.json({
      timeline,
      stats,
      insights
    })
  } catch (error) {
    console.error("Error getting activity data:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

function generateTimeline(posts, interactions) {
  const timeline = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(now, i), 'MMM dd')
    const dayPosts = posts.filter(post => 
      format(new Date(post.createdAt), 'MMM dd') === date
    ).length
    const dayInteractions = interactions.filter(interaction => 
      format(new Date(interaction.createdAt), 'MMM dd') === date
    ).length

    timeline.push({
      date,
      posts: dayPosts,
      interactions: dayInteractions
    })
  }

  return timeline
}

function generateInsights(posts, interactions, profile) {
  const insights = []
  const postsPerDay = posts.length / 30
  const interactionsPerDay = interactions.length / 30

  if (postsPerDay > 2) {
    insights.push("You're a very active content creator!")
  } else if (postsPerDay < 0.5) {
    insights.push("Consider posting more frequently to increase engagement")
  }

  if (interactionsPerDay > 5) {
    insights.push("Great job engaging with the community!")
  }

  if (profile.user._count.followers > profile.user._count.following * 2) {
    insights.push("You have a strong influence in the community")
  }

  return insights
} 