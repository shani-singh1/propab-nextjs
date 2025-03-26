"use client"

import { useState } from 'react'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { CreatePost } from "./create-post"

export function PostFeed({ initialPosts = [] }) {
  const { data: session } = useSession()
  const [posts, setPosts] = useState(initialPosts)

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts])
  }

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to like post')

      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ))

      toast.success('Post liked!')
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Failed to like post')
    }
  }

  return (
    <div className="space-y-6">
      <CreatePost onPostCreated={handleNewPost} />
      <div className="h-6" /> {/* Spacer */}
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              {post.user.image && (
                <img
                  src={post.user.image}
                  alt={post.user.name}
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{post.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{post.content}</p>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                disabled={!session}
              >
                <Heart className="mr-2 h-4 w-4" />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm" disabled={!session}>
                <MessageCircle className="mr-2 h-4 w-4" />
                {post._count.comments}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 