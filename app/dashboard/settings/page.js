import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { SocialConnections } from "@/components/settings/social-connections"
import { prisma } from "@/lib/prisma"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  try {
    const socialConnections = await prisma.socialConnection.findMany({
      where: { userId: session.user.id },
      select: {
        provider: true,
      }
    })

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Social Connections</h2>
              <p className="text-sm text-muted-foreground">
                Connect your social media accounts to enhance your digital twin
              </p>
            </CardHeader>
            <CardContent>
              <SocialConnections 
                connections={socialConnections.map(conn => conn.provider)} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading settings:', error)
    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <p className="text-muted-foreground">
              There was an error loading your settings. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
} 