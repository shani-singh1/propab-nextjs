import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

// Import existing components
import { Overview } from "@/components/digital-twin/dashboard/overview"
import { EvolutionTimeline } from "@/components/digital-twin/evolution-timeline"
import { PersonalityInsights } from "@/components/digital-twin/dashboard/personality-insights"
import { ConnectionStats } from "@/components/digital-twin/dashboard/connection-stats"
import { RecentActivity } from "@/components/digital-twin/dashboard/recent-activity"

export default async function TwinPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Fetch user's digital twin data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      personalityProfile: true,
      connections: true,
      activities: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) {
    redirect('/onboarding')
  }

  return (
    <div className="container space-y-8 py-8">
      {/* Top Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Overview user={user} />
        <ConnectionStats user={user} />
      </div>

      {/* Middle Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <PersonalityInsights user={user} />
        <RecentActivity activities={user.activities} />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6">
        <EvolutionTimeline userId={user.id} />
      </div>
    </div>
  )
} 