import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { PostFeed } from "@/components/community/post-feed"
import { prisma } from "@/lib/prisma"

export default async function CommunityPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  try {
    const posts = await prisma.post.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    })

    const trendingUsers = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      }
    })

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Community</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <PostFeed initialPosts={posts} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Trending Users</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      {user.image && (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user._count.posts} posts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading community:', error)
    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <p className="text-muted-foreground">
              There was an error loading the community page. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
} 