"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, UserPlus } from "lucide-react"
import { toast } from "react-hot-toast"

export function ConnectionRequests() {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/connections/requests')
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequest = async (requestId, action) => {
    try {
      const response = await fetch(`/api/connections/requests/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (!response.ok) throw new Error('Failed to handle request')

      setRequests(requests.filter(req => req.id !== requestId))
      toast.success(action === 'accept' ? 'Connection accepted!' : 'Request declined')
    } catch (error) {
      console.error('Error handling request:', error)
      toast.error('Failed to handle request')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-pulse space-y-4 w-full">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <UserPlus className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Connection Requests</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {requests.length} pending
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {request.sender.image && (
                  <img
                    src={request.sender.image}
                    alt={request.sender.name}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{request.sender.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.quality}% Match
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600"
                  onClick={() => handleRequest(request.id, 'accept')}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => handleRequest(request.id, 'decline')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 