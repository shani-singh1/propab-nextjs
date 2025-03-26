"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Send, FileText, Download, Pencil, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useWebSocket } from "@/hooks/use-websocket"
import { cn } from "@/lib/utils"
import { MessageReactions } from "./message-reactions"
import { FileUpload } from "./file-upload"
import Image from "next/image"
import { MessageSearch } from "./message-search"
import { MessageForward } from "./message-forward"

export function ChatWindow({ chatId, currentUser, otherUser }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false)
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const typingTimeoutRef = useRef(null)
  const scrollRef = useRef(null)
  const { toast } = useToast()
  const [editingMessage, setEditingMessage] = useState(null)

  useWebSocket((data) => {
    if (data.type === 'presence') {
      if (data.userId === otherUser.id) {
        setIsOtherUserOnline(data.isOnline)
      }
      return
    }

    if (data.type === 'typing' && data.chatId === chatId) {
      if (data.userId === otherUser.id) {
        setIsOtherUserTyping(data.isTyping)
      }
      return
    }

    if (data.type === 'read_receipt' && data.chatId === chatId) {
      if (data.userId === otherUser.id) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.messageId ? { ...msg, read: true } : msg
          )
        )
      }
      return
    }

    if (data.chatId === chatId) {
      setMessages(prev => [...prev, data])
      scrollToBottom()
    }
  })

  useEffect(() => {
    loadMessages()
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`)
      if (!response.ok) throw new Error()
      
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      toast.error("Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage })
      })

      if (!response.ok) throw new Error()
      
      const message = await response.json()
      setMessages(prev => [...prev, message])
      setNewMessage("")
    } catch (error) {
      toast.error("Failed to send message")
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const sendTypingStatus = (isTyping) => {
    fetch(`/api/chat/${chatId}/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTyping })
    })
  }

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send typing status
    sendTypingStatus(true)

    // Set timeout to clear typing status
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false)
    }, 2000)
  }

  const handleReaction = (messageId, reaction) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: reaction.removed
                ? msg.reactions.filter(r => 
                    !(r.userId === currentUser.id && r.emoji === reaction.emoji)
                  )
                : [...msg.reactions, reaction]
            }
          : msg
      )
    )
  }

  const handleFileUpload = async (file) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: file.type === "image" ? "Sent an image" : "Sent a file",
          attachment: file
        })
      })

      if (!response.ok) throw new Error()
      
      const message = await response.json()
      setMessages(prev => [...prev, message])
    } catch (error) {
      toast.error("Failed to send file")
    }
  }

  const handleEdit = async (messageId, newContent) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent })
      })

      if (!response.ok) throw new Error()
      
      const updatedMessage = await response.json()
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? updatedMessage : msg
        )
      )
      setEditingMessage(null)
    } catch (error) {
      toast.error("Failed to edit message")
    }
  }

  const handleDelete = async (messageId) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error()
      
      setMessages(prev =>
        prev.filter(msg => msg.id !== messageId)
      )
    } catch (error) {
      toast.error("Failed to delete message")
    }
  }

  const scrollToMessage = (messageId) => {
    const element = document.getElementById(`message-${messageId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      element.classList.add("highlight")
      setTimeout(() => element.classList.remove("highlight"), 2000)
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar>
              <AvatarImage src={otherUser.image} alt={otherUser.name} />
              <AvatarFallback>{otherUser.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                isOtherUserOnline ? "bg-green-500" : "bg-gray-300"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold">{otherUser.name}</h3>
            <p className="text-sm text-muted-foreground">
              {isOtherUserOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        {isOtherUserTyping && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {otherUser.name} is typing...
          </p>
        )}
        <MessageSearch
          chatId={chatId}
          onMessageSelect={scrollToMessage}
        />
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.userId === currentUser.id ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      message.userId === currentUser.id
                        ? currentUser.image
                        : otherUser.image
                    }
                    alt={
                      message.userId === currentUser.id
                        ? currentUser.name
                        : otherUser.name
                    }
                  />
                  <AvatarFallback>
                    {message.userId === currentUser.id
                      ? currentUser.name?.charAt(0)
                      : otherUser.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div
                    className={`rounded-lg p-3 max-w-[70%] ${
                      message.userId === currentUser.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.attachments?.[0]?.type === "image" ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={message.attachments[0].url}
                          alt="Uploaded image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : message.attachments?.[0]?.type === "file" ? (
                      <a
                        href={message.attachments[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        <span>{message.attachments[0].name}</span>
                        <Download className="h-4 w-4" />
                      </a>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageReactions
                      messageId={message.id}
                      reactions={message.reactions}
                      currentUserId={currentUser.id}
                      onReact={(reaction) => handleReaction(message.id, reaction)}
                    />
                    <MessageForward message={message} />
                    {message.userId === currentUser.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setEditingMessage(message.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDelete(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {message.userId === currentUser.id && (
                  <span className="text-xs text-muted-foreground">
                    {message.read ? "Read" : "Sent"}
                  </span>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <form
        onSubmit={sendMessage}
        className="border-t p-4 flex gap-2"
      >
        <FileUpload onUpload={handleFileUpload} />
        <Input
          value={newMessage}
          onChange={handleMessageChange}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  )
} 