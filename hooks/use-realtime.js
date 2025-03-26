import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useRealtime({ onPostUpdate, onCommentUpdate }) {
  const { toast } = useToast()

  useEffect(() => {
    const eventSource = new EventSource('/api/updates')

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "ping") return

      switch (data.type) {
        case "post_update":
          onPostUpdate?.(data.post)
          break
        case "new_comment":
          onCommentUpdate?.(data.comment)
          toast({
            title: "New Comment",
            description: `${data.comment.author.name} commented on a post`
          })
          break
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [onPostUpdate, onCommentUpdate])
} 