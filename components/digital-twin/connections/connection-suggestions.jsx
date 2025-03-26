"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Sparkles,
  Brain,
  Heart,
  Target,
  MessageCircle,
  UserPlus,
  ChevronRight
} from "lucide-react"
import { ConnectionDetails } from "./connection-details"
import { AutopilotMode } from "./autopilot-mode"
import { trackAction } from "@/lib/utils/track-action"

export function ConnectionSuggestions({ userId }) {
  const [suggestions, setSuggestions] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [isAutopilotActive, setIsAutopilotActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}/connections/suggestions`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      toast.error("Failed to load connection suggestions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (suggestion) => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: suggestion.user.id,
          notes: suggestion.connectionNotes
        })
      })

      if (!response.ok) throw new Error()
      
      await trackAction(userId, "CONNECTION", {
        quality: suggestion.compatibility.score,
        targetUserId: suggestion.user.id
      })

      toast.success("Connection request sent!")
      loadSuggestions()
    } catch (error) {
      toast.error("Failed to send connection request")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <h2 className="text-lg font-semibold">AI-Powered Connections</h2>
            </div>
            <Button
              variant={isAutopilotActive ? "default" : "outline"}
              onClick={() => setIsAutopilotActive(!isAutopilotActive)}
            >
              <Brain className="h-4 w-4 mr-2" />
              Autopilot Mode
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAutopilotActive ? (
            <AutopilotMode
              userId={userId}
              onDeactivate={() => setIsAutopilotActive(false)}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.user.id}
                    suggestion={suggestion}
                    onSelect={() => setSelectedUser(suggestion)}
                    onConnect={() => handleConnect(suggestion)}
                  />
                ))}
              </div>
              <div>
                <AnimatePresence mode="wait">
                  {selectedUser ? (
                    <ConnectionDetails
                      suggestion={selectedUser}
                      onClose={() => setSelectedUser(null)}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex items-center justify-center text-muted-foreground"
                    >
                      Select a suggestion to see details
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SuggestionCard({ suggestion, onSelect, onConnect }) {
  const { user, compatibility } = suggestion

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(suggestion)}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              )}
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {user.personalityProfile?.headline || "Digital Twin User"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={(e) => {
              e.stopPropagation()
              onConnect(suggestion)
            }}>
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Compatibility Score</span>
              <span className="font-medium">
                {Math.round(compatibility.score * 100)}%
              </span>
            </div>
            <Progress value={compatibility.score * 100} className="h-1.5" />
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{Math.round(compatibility.factors.personality * 100)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span>{Math.round(compatibility.factors.interests * 100)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{Math.round(compatibility.factors.goals * 100)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 