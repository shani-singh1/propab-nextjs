"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageSquare,
  UserPlus,
  UserMinus,
  Star,
  Activity,
  ChevronDown,
  ChevronUp,
  Brain
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export function ConnectionCard({ connection, userId }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAccept = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/digital-twin/${userId}/connections/${connection.id}/accept`, {
        method: "POST"
      })
      if (!response.ok) throw new Error()
      toast.success("Connection accepted")
    } catch (error) {
      console.error("Error accepting connection:", error)
      toast.error("Failed to accept connection")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/digital-twin/${userId}/connections/${connection.id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error()
      toast.success("Connection removed")
    } catch (error) {
      console.error("Error removing connection:", error)
      toast.error("Failed to remove connection")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={connection.twin.image} alt={connection.twin.name} />
          <AvatarFallback>{connection.twin.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{connection.twin.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{Math.round(connection.quality * 100)}%</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {connection.twin.personalityProfile?.interests.slice(0, 3).join(", ")}
          </div>

          <div className="flex items-center gap-4 pt-2">
            {connection.status === "PENDING" ? (
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={loading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Accept
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Compatibility</span>
                  <span className="text-muted-foreground">
                    {Math.round(connection.compatibility * 100)}%
                  </span>
                </div>
                <Progress value={connection.compatibility * 100} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-medium">Engagement</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(connection.engagement * 100)}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4" />
                    <span className="text-sm font-medium">Synergy</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(connection.synergy * 100)}%
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleRemove}
                  disabled={loading}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove Connection
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
} 