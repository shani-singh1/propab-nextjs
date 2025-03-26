"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Heart } from "lucide-react"

export function RecentActivity({ activity }) {
  return (
    <div className="space-y-8">
      {activity.map((item) => (
        <div key={item.id} className="flex items-start space-x-4">
          <Link href={`/profile/${item.author.id}`}>
            <img
              src={item.author.image || `https://avatar.vercel.sh/${item.author.id}`}
              alt={item.author.name}
              className="h-10 w-10 rounded-full"
            />
          </Link>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Link href={`/profile/${item.author.id}`}>
                <span className="font-medium hover:underline">
                  {item.author.name}
                </span>
              </Link>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {item._count.likes}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {item._count.comments}
              </div>
            </div>
          </div>
        </div>
      ))}
      {activity.length === 0 && (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      )}
    </div>
  )
} 