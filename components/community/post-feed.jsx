"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { Post } from "./post"
import { useRealtime } from "@/hooks/use-realtime"

export function PostFeed({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [ref, inView] = useInView()

  useRealtime({
    onPostUpdate: (updatedPost) => {
      setPosts(prev => prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ))
    }
  })

  useEffect(() => {
    if (inView && hasMore) {
      loadMorePosts()
    }
  }, [inView])

  const loadMorePosts = async () => {
    try {
      const response = await fetch(`/api/posts?page=${page + 1}`)
      const data = await response.json()

      if (data.length === 0) {
        setHasMore(false)
        return
      }

      setPosts(prev => [...prev, ...data])
      setPage(prev => prev + 1)
    } catch (error) {
      console.error("Error loading more posts:", error)
    }
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {hasMore && (
        <div ref={ref} className="h-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      )}
    </div>
  )
} 