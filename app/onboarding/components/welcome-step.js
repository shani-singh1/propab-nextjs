"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export function WelcomeStep() {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="space-y-4 text-center">
        <div className="mx-auto w-32 h-32 relative mb-6">
          <Image
            src="/onboarding-welcome.svg"
            alt="Welcome"
            fill
            className="object-contain"
          />
        </div>
        <h3 className="text-xl font-semibold">
          Welcome to Your Digital Twin Journey
        </h3>
        <p className="text-muted-foreground">
          We'll guide you through a series of questions to create your digital twin.
          This will help us understand your personality and interests better.
        </p>
      </CardContent>
    </Card>
  )
} 