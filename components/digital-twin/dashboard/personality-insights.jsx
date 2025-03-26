"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Brain, Sparkles } from "lucide-react"

export function PersonalityInsights({ user }) {
  const profile = user.personalityProfile || {}
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Personality Insights</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(profile).map(([trait, value]) => (
            <div key={trait} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="capitalize">{trait}</span>
                </div>
                <span className="text-sm font-medium">{Math.round(value * 100)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 