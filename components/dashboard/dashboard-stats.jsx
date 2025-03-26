"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, MessageSquare, Heart, Brain } from "lucide-react"

export function DashboardStats({ stats }) {
  const statItems = [
    {
      title: "Followers",
      value: stats._count.followers,
      icon: Users,
      description: "People following you"
    },
    {
      title: "Following",
      value: stats._count.following,
      icon: Users,
      description: "People you follow"
    },
    {
      title: "Posts",
      value: stats._count.posts,
      icon: MessageSquare,
      description: "Posts you've shared"
    },
    {
      title: "Interests",
      value: stats.personalityProfile?.interests?.length || 0,
      icon: Heart,
      description: "Topics you care about"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">{item.title}</h3>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 