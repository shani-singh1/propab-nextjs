"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function SuggestedUsers({ users, currentUser }) {
  const [followingStates, setFollowingStates] = useState({})
  const { toast } = useToast()

  const handleFollow = async (userId) => {
    try {
      const method = followingStates[userId] ? 'DELETE' : 'POST'
      const response = await fetch(`/api/users/${userId}/follow`, { method })

      if (!response.ok) throw new Error()

      setFollowingStates(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Suggested Users</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
              <img
                src={user.image || `https://avatar.vercel.sh/${user.id}`}
                alt={user.name}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {user._count.followers} followers
                </p>
              </div>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFollow(user.id)}
            >
              {followingStates[user.id] ? 'Unfollow' : 'Follow'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 