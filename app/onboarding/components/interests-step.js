"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const INTEREST_CATEGORIES = [
  'Technology',
  'Science',
  'Arts',
  'Sports',
  'Music',
  'Literature',
  'Travel',
  'Food',
  'Gaming',
  'Nature',
  'Politics',
  'Business',
  'Health',
  'Education',
  'Entertainment'
]

export function InterestsStep({ onNext }) {
  const [selectedInterests, setSelectedInterests] = useState([])

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onNext({ interests: selectedInterests })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Your Interests</h2>
          <p className="text-muted-foreground">
            Select topics that interest you (choose at least 3)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {INTEREST_CATEGORIES.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`p-3 rounded-lg text-sm transition-colors ${
                  selectedInterests.includes(interest)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <Button
            type="submit"
            disabled={selectedInterests.length < 3}
            className="w-full"
          >
            Next
          </Button>
        </CardContent>
      </Card>
    </form>
  )
} 