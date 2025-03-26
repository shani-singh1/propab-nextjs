import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { ProfileForm } from "./components/profile-form"
import { SocialConnections } from "./components/social-connections"
import prisma from "@/lib/prisma"

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      socialConnections: true,
      personalityProfile: true
    }
  })

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile information and connected accounts
          </p>
        </div>

        <ProfileForm user={user} />
        <SocialConnections user={user} />
      </div>
    </div>
  )
} 