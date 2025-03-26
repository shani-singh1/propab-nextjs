"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useRealtime } from "@/hooks/use-realtime"

export function Comments({ postId }) {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { toast } = useToast()

  useRealtime({
    onCommentUpdate: (newComment) => {
      if (newComment.postId === postId) {
        setComments(prev => [newComment, ...prev])
      }
    }
  })

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments?page=${page}`)
      const data = await response.json()

      if (data.length === 0) {
        setHasMore(false)
        return
      }

      setComments(prev => [...prev, ...data])
      setPage(prev => prev + 1)
    } catch (error) {
      toast.error("Failed to load comments")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-4">
          <Link href={`/profile/${comment.author.id}`}>
            <img
              src={comment.author.image || `https://avatar.vercel.sh/${comment.author.id}`}
              alt={comment.author.name}
              className="h-10 w-10 rounded-full"
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/profile/${comment.author.id}`}>
                <span className="font-medium hover:underline">
                  {comment.author.name}
                </span>
              </Link>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm mt-1">{comment.content}</p>
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          onClick={loadComments}
          className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
        >
          Load more comments
        </button>
      )}
    </div>
  )
} 