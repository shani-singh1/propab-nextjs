"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Heart, MessageSquare, Share } from "lucide-react"
import { Comments } from "./comments"

export function Post({ post }) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post._count.likes)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState("")
  const { toast } = useToast()

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST'
      })

      if (!response.ok) throw new Error()

      setIsLiked(!isLiked)
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    } catch (error) {
      toast.error("Failed to like post. Please try again.")
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment })
      })

      if (!response.ok) throw new Error()

      setComment("")
      setShowComments(false)
      setTimeout(() => setShowComments(true), 100)
      toast.success("Comment added successfully!")
    } catch (error) {
      toast.error("Failed to add comment. Please try again.")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Link href={`/profile/${post.author.id}`}>
          <img
            src={post.author.image || `https://avatar.vercel.sh/${post.author.id}`}
            alt={post.author.name}
            className="h-10 w-10 rounded-full"
          />
        </Link>
        <div className="flex-1">
          <Link href={`/profile/${post.author.id}`}>
            <p className="font-medium hover:underline">{post.author.name}</p>
          </Link>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleLike}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            {post._count.comments}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardFooter>
      {showComments && (
        <div className="px-6 pb-6 space-y-6">
          <form onSubmit={handleComment} className="space-y-4">
            <Textarea
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!comment.trim()}
            >
              Comment
            </Button>
          </form>
          <Comments postId={post.id} />
        </div>
      )}
    </Card>
  )
} 