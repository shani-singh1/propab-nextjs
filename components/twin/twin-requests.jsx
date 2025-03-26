"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { UserCheck, Check, X } from "lucide-react"

export function TwinRequests() {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const response = await fetch("/api/twins/requests")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      toast.error("Failed to load connection requests")
    } finally {
      setIsLoading(false)
    }
  }

  const respondToRequest = async (connectionId, status) => {
    try {
      const response = await fetch(`/api/twins/connect/${connectionId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error()

      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.id !== connectionId))
      
      toast.success(
        status === "ACCEPTED"
          ? "Connection request accepted!"
          : "Connection request declined"
      )
    } catch (error) {
      toast.error("Failed to respond to request")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Connection Requests</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[100px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Connection Requests</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.user.image} alt={request.user.name} />
                <AvatarFallback>
                  {request.user.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{request.user.name}</h4>
                  <span className="text-sm font-medium">
                    {request.matchScore}% Match
                  </span>
                </div>
                <Progress value={request.matchScore} className="h-2" />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => respondToRequest(request.id, "ACCEPTED")}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => respondToRequest(request.id, "REJECTED")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 