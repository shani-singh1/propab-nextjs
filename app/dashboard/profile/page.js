import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SocialConnect } from "@/components/profile/social-connect"
import prisma from "@/lib/prisma"
import { Toaster } from "@/components/ui/toaster"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { PersonalityChart } from "@/components/profile/personality-chart"
import Link from "next/link"

export default async function ProfileSettings() {
  const session = await getServerSession(authOptions)
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  useEffect(() => {
    if (searchParams.get('connected') === 'true') {
      toast({
        title: "Connected Successfully",
        description: "Your social media account has been connected.",
      })
    } else if (searchParams.get('error') === 'true') {
      toast({
        title: "Connection Error",
        description: "There was a problem connecting your account.",
        variant: "destructive",
      })
    }
  }, [searchParams, toast])
  
  const [socialConnections, personalityProfile] = await Promise.all([
    prisma.socialConnection.findMany({
      where: { userId: session.user.id }
    }),
    prisma.personalityProfile.findUnique({
      where: { userId: session.user.id }
    })
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-2xl">{session.user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-2xl">{session.user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Social Media Integration</h2>
            <p className="text-sm text-muted-foreground">
              Connect your social media accounts to enhance your digital twin
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <SocialConnect platform="twitter" connections={socialConnections} />
            <SocialConnect platform="linkedin" connections={socialConnections} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Personality Profile</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {personalityProfile?.traits ? (
              <>
                <PersonalityChart traits={personalityProfile.traits} />
                <div className="prose dark:prose-invert">
                  <h3>Your Top Traits</h3>
                  <ul>
                    {Object.entries(personalityProfile.traits)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 3)
                      .map(([trait, value]) => (
                        <li key={trait}>
                          {trait.charAt(0).toUpperCase() + trait.slice(1)}: {Math.round(value * 100)}%
                        </li>
                      ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Complete the personality assessment to see your profile
                </p>
                <Button asChild>
                  <Link href="/onboarding">Take Assessment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 