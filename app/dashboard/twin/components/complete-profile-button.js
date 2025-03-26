'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export function CompleteProfileButton() {
  const router = useRouter()

  return (
    <Button
      onClick={() => router.push('/onboarding')}
      className="mt-4"
    >
      Complete Profile
    </Button>
  )
} 