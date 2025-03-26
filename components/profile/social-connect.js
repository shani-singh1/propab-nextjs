"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Twitter, Linkedin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function SocialConnect({ platform, connections = [] }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  
  const isConnected = connections.some(conn => conn.platform === platform)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch(`/api/social/connect/${platform}`)
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to initiate social media connection",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch(`/api/social/disconnect/${platform}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to disconnect')

      startTransition(() => {
        router.refresh()
      })

      toast({
        title: "Disconnected",
        description: `Successfully disconnected ${platform}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        {platform === 'twitter' ? (
          <Twitter className="h-5 w-5 text-blue-400" />
        ) : (
          <Linkedin className="h-5 w-5 text-blue-600" />
        )}
        <div>
          <h3 className="font-medium capitalize">{platform}</h3>
          <p className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>
      <Button
        variant={isConnected ? "destructive" : "outline"}
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={isConnecting || isPending}
      >
        {(isConnecting || isPending) && (
          <LoadingSpinner className="mr-2 h-4 w-4" />
        )}
        {isConnected ? 'Disconnect' : 'Connect'}
      </Button>
    </div>
  )
} 