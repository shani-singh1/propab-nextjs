"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Twitter, Linkedin, Github, Loader2, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const SOCIAL_PLATFORMS = [
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    color: "text-blue-400"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-600"
  },
  {
    id: "github",
    name: "GitHub",
    icon: Github,
    color: "text-gray-900"
  }
]

export function SocialConnections({ user }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedPlatforms, setConnectedPlatforms] = useState(
    user.socialConnections?.reduce((acc, conn) => {
      acc[conn.platform] = conn
      return acc
    }, {}) || {}
  )
  const { toast } = useToast()

  const handleConnect = async (platform) => {
    setIsConnecting(true)
    try {
      const response = await fetch(`/api/social/connect/${platform}`)
      if (!response.ok) throw new Error()
      
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error(`Failed to connect ${platform}`)
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async (platform) => {
    try {
      const response = await fetch(`/api/social/disconnect/${platform}`, {
        method: "POST"
      })
      if (!response.ok) throw new Error()
      
      setConnectedPlatforms(prev => {
        const next = { ...prev }
        delete next[platform]
        return next
      })
      toast.success(`Disconnected ${platform}`)
    } catch (error) {
      toast.error(`Failed to disconnect ${platform}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Connected Accounts</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const isConnected = platform.id in connectedPlatforms
            const Icon = platform.icon

            return (
              <div
                key={platform.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${platform.color}`} />
                  <div>
                    <p className="font-medium">{platform.name}</p>
                    {isConnected && (
                      <p className="text-sm text-muted-foreground">
                        Connected as {connectedPlatforms[platform.id].username}
                      </p>
                    )}
                  </div>
                </div>
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isConnected ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(connectedPlatforms[platform.id].profileUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(platform.id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 