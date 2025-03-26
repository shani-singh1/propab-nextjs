"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Activity } from "lucide-react"

export function RecentActivity({ activities }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Recent Activity</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50"
              >
                <Activity className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 