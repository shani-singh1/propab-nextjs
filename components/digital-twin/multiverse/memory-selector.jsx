"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Calendar, Star, Brain } from "lucide-react"
import { format } from "date-fns"

export function MemorySelector({ userId, onSelect }) {
  const [memories, setMemories] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}/memories`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setMemories(data)
    } catch (error) {
      console.error("Failed to load memories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMemories = memories.filter(memory =>
    memory.content.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.topics.some(topic => 
      topic.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <MemorySkeleton key={i} />
            ))
          ) : (
            filteredMemories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onClick={() => onSelect(memory)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function MemoryCard({ memory, onClick }) {
  const getImportanceColor = (importance) => {
    if (importance > 0.8) return "text-red-500"
    if (importance > 0.5) return "text-yellow-500"
    return "text-blue-500"
  }

  return (
    <Card
      className="p-4 cursor-pointer hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(memory.createdAt), "MMM d, yyyy")}
              </span>
            </div>
            <p className="line-clamp-2">{memory.content.toString()}</p>
          </div>
          <Star 
            className={`h-4 w-4 ${getImportanceColor(memory.importance)}`} 
          />
        </div>

        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {memory.topics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 bg-muted rounded-full text-xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function MemorySkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
} 