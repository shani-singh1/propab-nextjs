import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"

export default async function ProfilePage({ params }) {
  const session = await getServerSession(authOptions)
  const { userId } = params

  const [user, isFollowing] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        },
        personalityProfile: true
      }
    }),
    prisma.follows.findFirst({
      where: {
        followerId: session.user.id,
        followingId: userId
      }
    })
  ])

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <ProfileHeader 
        user={user} 
        isCurrentUser={session.user.id === userId}
        isFollowing={!!isFollowing}
      />
      <ProfileTabs userId={userId} />
    </div>
  )
} 