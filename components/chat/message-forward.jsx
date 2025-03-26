"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Share2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export function MessageForward({ message }) {
  const [isOpen, setIsOpen] = useState(false)
  const [chats, setChats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

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

  const handleForward = async (chatId) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message.content,
          forwardedFrom: message.id,
          attachments: message.attachments
        })
      })

      if (!response.ok) throw new Error()
      
      toast.success("Message forwarded")
      setIsOpen(false)
    } catch (error) {
      toast.error("Failed to forward message")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} onOpenAutoFocus={loadChats}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forward Message</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {chats.map((chat) => {
              const otherUser = chat.users.find(u => u.id !== message.userId)
              return (
                <button
                  key={chat.id}
                  onClick={() => handleForward(chat.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={otherUser.image} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{otherUser.name}</span>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 