"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { PersonalityChart } from "./personality-chart"

export function ProfileHeader({ user, isCurrentUser, isFollowing }) {
  const { toast } = useToast()
  const [following, setFollowing] = useState(isFollowing)

  const handleFollow = async () => {
    try {
      const method = following ? 'DELETE' : 'POST'
      const response = await fetch(`/api/users/${user.id}/follow`, { method })

      if (!response.ok) throw new Error()

      setFollowing(!following)
      toast.success(following ? 'Unfollowed successfully' : 'Followed successfully')
    } catch (error) {
      toast.error("Failed to follow user. Please try again.")
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <img
                src={user.image || `https://avatar.vercel.sh/${user.id}`}
                alt={user.name}
                className="h-20 w-20 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</p>
              </div>
              {!isCurrentUser && (
                <Button
                  variant={following ? "outline" : "default"}
                  onClick={handleFollow}
                >
                  {following ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              <div>
                <p className="text-2xl font-bold">{user._count.followers}</p>
                <p className="text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{user._count.following}</p>
                <p className="text-muted-foreground">Following</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{user._count.posts}</p>
                <p className="text-muted-foreground">Posts</p>
              </div>
            </div>
          </div>

          {user.personalityProfile && (
            <div className="w-full md:w-1/2">
              <PersonalityChart traits={user.personalityProfile.traits} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 