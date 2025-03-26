import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export function CommunityTrends({ trends }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4" />
          <h3 className="font-semibold">Trending Topics</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend) => (
            <div key={trend.topic} className="flex justify-between items-center">
              <span className="text-sm font-medium">#{trend.topic}</span>
              <span className="text-sm text-muted-foreground">
                {trend._count._all} posts
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 