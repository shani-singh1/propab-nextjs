"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function MessageSearch({ chatId, onMessageSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/chat/${chatId}/messages/search?q=${encodeURIComponent(searchQuery)}`
      )
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Failed to search messages:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelect = (messageId) => {
    onMessageSelect(messageId)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 py-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            Search
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {results.map((message) => (
              <button
                key={message.id}
                className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors"
                onClick={() => handleSelect(message.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{message.user.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {message.content}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 