"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Gift, Clock, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function RewardsList({ rewards }) {
  const [claimingId, setClaimingId] = useState(null)
  const { toast } = useToast()

  const handleClaim = async (rewardId) => {
    setClaimingId(rewardId)
    try {
      const response = await fetch(`/api/digital-twin/rewards/${rewardId}/claim`, {
        method: "POST"
      })
      
      if (!response.ok) throw new Error()
      
      toast.success("Reward claimed successfully!")
    } catch (error) {
      toast.error("Failed to claim reward")
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Rewards</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onClaim={() => handleClaim(reward.id)}
              claiming={claimingId === reward.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RewardCard({ reward, onClaim, claiming }) {
  const { name, description, value, claimed, expiresAt } = reward
  const expired = expiresAt && new Date(expiresAt) < new Date()

  return (
    <Card className={claimed ? "bg-muted" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{name}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
            {value && (
              <div className="flex items-center gap-1 mt-2 text-sm">
                <span className="font-medium text-primary">
                  +{value} XP
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {expiresAt && !claimed && !expired && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Expires in {formatTimeLeft(expiresAt)}
                </span>
              </div>
            )}
            {claimed ? (
              <div className="flex items-center gap-1 text-sm text-green-500">
                <Check className="h-4 w-4" />
                <span>Claimed</span>
              </div>
            ) : expired ? (
              <div className="text-sm text-muted-foreground">
                Expired
              </div>
            ) : (
              <Button
                size="sm"
                onClick={onClaim}
                disabled={claiming}
              >
                {claiming ? "Claiming..." : "Claim"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatTimeLeft(expiresAt) {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diff = expiry - now

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
} 