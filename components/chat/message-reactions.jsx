"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover"
import { Smile } from "lucide-react"

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

export function MessageReactions({ messageId, reactions, currentUserId, onReact }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleReaction = async (emoji) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji })
      })

      if (!response.ok) throw new Error()
      
      const reaction = await response.json()
      onReact(reaction)
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to add reaction:", error)
    }
  }

  const groupedReactions = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = acc[reaction.emoji] || []
    acc[reaction.emoji].push(reaction)
    return acc
  }, {})

  return (
    <div className="flex items-center gap-1">
      {Object.entries(groupedReactions).map(([emoji, reactions]) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className="h-6 px-1"
          onClick={() => handleReaction(emoji)}
        >
          {emoji} {reactions.length}
        </Button>
      ))}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 