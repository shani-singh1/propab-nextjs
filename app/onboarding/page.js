import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { OnboardingForm } from "./components/onboarding-form"
import prisma from "@/lib/prisma"
import { InterestsStep } from "./components/interests-step"
import { PersonalityStep } from "./components/personality-step"
import { SocialStep } from "./components/social-step"

const STEPS = [
  { id: "interests", title: "Interests", component: InterestsStep },
  { id: "personality", title: "Personality", component: PersonalityStep },
  { id: "social", title: "Social Connections", component: SocialStep }
]

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (user?.onboardingComplete) {
    redirect("/dashboard")
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome to Digital Twin</h1>
          <p className="text-muted-foreground">
            Let's personalize your experience. This will help us create your digital twin.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
} 