"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  Phone, Video, Clock, Calendar, Download,
  BarChart2, MessageSquare, Brain 
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export function CallHistory({ userId }) {
  const [calls, setCalls] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadCalls()
  }, [filter])

  const loadCalls = async () => {
    try {
      const response = await fetch(`/api/calls/history?filter=${filter}`)
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setCalls(data)
    } catch (error) {
      toast.error("Failed to load call history")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Call History</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "voice" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("voice")}
            >
              Voice
            </Button>
            <Button
              variant={filter === "video" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("video")}
            >
              Video
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calls.map((call) => (
            <CallHistoryItem key={call.id} call={call} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CallHistoryItem({ call }) {
  const [showAnalysis, setShowAnalysis] = useState(false)

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={call.partner.image} alt={call.partner.name} />
            <AvatarFallback>{call.partner.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{call.partner.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {call.type === "voice" ? (
                <Phone className="h-3 w-3" />
              ) : (
                <Video className="h-3 w-3" />
              )}
              <span>{format(new Date(call.createdAt), "MMM d, yyyy")}</span>
              <Clock className="h-3 w-3 ml-2" />
              <span>{call.duration}s</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {call.recordingUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(call.recordingUrl)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnalysis(!showAnalysis)}
          >
            <Brain className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showAnalysis && call.analysis && (
        <div className="pt-4 border-t">
          <Tabs defaultValue="sentiment">
            <TabsList>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              {call.transcript && (
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="sentiment" className="pt-4">
              <CallSentimentAnalysis analysis={call.analysis} />
            </TabsContent>
            <TabsContent value="topics" className="pt-4">
              <CallTopicsAnalysis analysis={call.analysis} />
            </TabsContent>
            {call.transcript && (
              <TabsContent value="transcript" className="pt-4">
                <p className="text-sm whitespace-pre-wrap">{call.transcript}</p>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  )
}

function CallSentimentAnalysis({ analysis }) {
  return (
    <div className="space-y-4">
      {analysis.sentiment && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(analysis.sentiment.emotions).map(([emotion, score]) => (
            <div key={emotion} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{emotion}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(score * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CallTopicsAnalysis({ analysis }) {
  return (
    <div className="flex flex-wrap gap-2">
      {analysis.topics?.map((topic) => (
        <div
          key={topic.topic}
          className="px-2 py-1 rounded-full bg-muted text-sm"
        >
          {topic.topic}
          <span className="ml-1 text-muted-foreground">
            {Math.round(topic.confidence * 100)}%
          </span>
        </div>
      ))}
    </div>
  )
} 