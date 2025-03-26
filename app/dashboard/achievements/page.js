import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  try {
    const achievements = await prisma.achievement.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        unlockedAt: 'desc'
      }
    })

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Achievements</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardHeader>
                  <h3 className="text-xl font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p>{achievement.description}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">
                  No achievements yet. Keep interacting to unlock achievements!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading achievements:', error)
    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <p className="text-muted-foreground">
              There was an error loading your achievements. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
} 