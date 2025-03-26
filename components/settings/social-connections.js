"use client"

import { useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Twitter, Linkedin } from "lucide-react"
import toast from "react-hot-toast"

export function SocialConnections({ connections = [] }) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async (provider) => {
    setIsConnecting(true)
    try {
      const response = await fetch(`/api/social/connect/${provider}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to connect')
      }

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.success(`Successfully connected to ${provider}`)
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast.error(`Failed to connect to ${provider}. Please try again.`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async (provider) => {
    try {
      const response = await fetch(`/api/social/disconnect/${provider}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      toast.success(`Disconnected from ${provider}`)
    } catch (error) {
      console.error('Disconnection error:', error)
      toast.error(`Failed to disconnect from ${provider}. Please try again.`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleConnect('twitter')}
          disabled={isConnecting || connections.includes('twitter')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1DA1F2] rounded-md hover:bg-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Twitter className="w-4 h-4" />
          {connections.includes('twitter') ? 'Connected' : 'Connect Twitter'}
          {isConnecting && <LoadingSpinner className="w-4 h-4" />}
        </button>
        {connections.includes('twitter') && (
          <button
            onClick={() => handleDisconnect('twitter')}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Disconnect
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => handleConnect('linkedin')}
          disabled={isConnecting || connections.includes('linkedin')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0A66C2] rounded-md hover:bg-[#084482] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Linkedin className="w-4 h-4" />
          {connections.includes('linkedin') ? 'Connected' : 'Connect LinkedIn'}
          {isConnecting && <LoadingSpinner className="w-4 h-4" />}
        </button>
        {connections.includes('linkedin') && (
          <button
            onClick={() => handleDisconnect('linkedin')}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  )
} 