"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

const PERSONALITY_TRAITS = [
  { id: 'openness', label: 'Openness to Experience', description: 'Curiosity and willingness to try new things' },
  { id: 'conscientiousness', label: 'Conscientiousness', description: 'Organization and responsibility' },
  { id: 'extraversion', label: 'Extraversion', description: 'Energy from social interactions' },
  { id: 'agreeableness', label: 'Agreeableness', description: 'Compassion and cooperation' },
  { id: 'neuroticism', label: 'Emotional Stability', description: 'Ability to handle stress and emotions' }
]

export function PersonalityStep({ onNext, onBack }) {
  const [traits, setTraits] = useState({
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onNext({ traits })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Personality Assessment</h2>
          <p className="text-muted-foreground">
            Rate yourself on these personality dimensions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {PERSONALITY_TRAITS.map(({ id, label, description }) => (
            <div key={id} className="space-y-2">
              <Label>
                {label}
                <span className="text-sm text-muted-foreground ml-2">
                  {description}
                </span>
              </Label>
              <Slider
                value={[traits[id]]}
                onValueChange={([value]) => 
                  setTraits(prev => ({ ...prev, [id]: value }))
                }
                min={0}
                max={100}
                step={1}
              />
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              Back
            </Button>
            <Button type="submit">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
} 