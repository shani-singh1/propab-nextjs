"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain, Users, Star } from "lucide-react"

export function Overview({ user }) {
  const twinScore = calculateTwinScore(user)
  
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Digital Twin Overview</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Twin Score</h3>
                <p className="text-3xl font-bold">{twinScore}%</p>
              </div>
            </div>
            <Progress value={twinScore} className="w-24" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Connections</span>
              </div>
              <p className="text-2xl font-bold">{user.connections.length}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Level</span>
              </div>
              <p className="text-2xl font-bold">{user.level || 1}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 