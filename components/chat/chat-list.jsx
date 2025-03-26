"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useWebSocket } from "@/hooks/use-websocket"

export function ChatList({ currentUserId, selectedChatId }) {
  const [chats, setChats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useWebSocket((message) => {
    setChats(prev => {
      const chatIndex = prev.findIndex(chat => chat.id === message.chatId)
      if (chatIndex === -1) return prev

      const newChats = [...prev]
      newChats[chatIndex] = {
        ...newChats[chatIndex],
        messages: [message],
        updatedAt: new Date().toISOString()
      }

      // Sort chats by latest message
      return newChats.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )
    })
  })

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const response = await fetch("/api/chat")
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setChats(data)
    } catch (error) {
      toast.error("Failed to load chats")
    } finally {
      setIsLoading(false)
    }
  }

  const getOtherUser = (chat) => {
    return chat.users.find(user => user.id !== currentUserId)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Messages</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-[200px]" />
                  <div className="h-3 bg-muted animate-pulse rounded w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Messages</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {chats.length} chat{chats.length !== 1 && "s"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1">
            {chats.map((chat) => {
              const otherUser = getOtherUser(chat)
              const lastMessage = chat.messages[0]
              const isSelected = chat.id === selectedChatId

              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
                    isSelected && "bg-muted"
                  )}
                >
                  <Avatar>
                    <AvatarImage src={otherUser.image} alt={otherUser.name} />
                    <AvatarFallback>
                      {otherUser.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">
                        {otherUser.name}
                      </h4>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(lastMessage.createdAt), {
                            addSuffix: true
                          })}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 