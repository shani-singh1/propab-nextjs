'use client'

import { useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    console.error('Achievements error:', error)
  }, [error])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="text-center py-6">
          <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'An error occurred while loading achievements.'}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    </div>
  )
} 