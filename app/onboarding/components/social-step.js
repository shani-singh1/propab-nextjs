'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function SocialStep({ onNext, onBack }) {
  const [socialPreferences, setSocialPreferences] = useState({
    connectionStyle: 'balanced',
    communicationFrequency: 'moderate',
    interactionType: 'mixed'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onNext(socialPreferences)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Social Preferences</h2>
          <p className="text-muted-foreground">
            Help us understand how you prefer to interact with others
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Connection Style</Label>
            <RadioGroup
              value={socialPreferences.connectionStyle}
              onValueChange={(value) => 
                setSocialPreferences(prev => ({ ...prev, connectionStyle: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reserved" id="reserved" />
                <Label htmlFor="reserved">Reserved - Prefer deeper, fewer connections</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balanced" id="balanced" />
                <Label htmlFor="balanced">Balanced - Mix of deep and casual connections</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outgoing" id="outgoing" />
                <Label htmlFor="outgoing">Outgoing - Enjoy many social connections</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Communication Frequency</Label>
            <RadioGroup
              value={socialPreferences.communicationFrequency}
              onValueChange={(value) =>
                setSocialPreferences(prev => ({ ...prev, communicationFrequency: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low - Prefer occasional check-ins</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate">Moderate - Regular but not constant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High - Enjoy frequent communication</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Interaction Type</Label>
            <RadioGroup
              value={socialPreferences.interactionType}
              onValueChange={(value) =>
                setSocialPreferences(prev => ({ ...prev, interactionType: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text">Text-based - Prefer written communication</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed" />
                <Label htmlFor="mixed">Mixed - Combination of text and voice/video</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rich" id="rich" />
                <Label htmlFor="rich">Rich Media - Prefer voice/video calls</Label>
              </div>
            </RadioGroup>
          </div>

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