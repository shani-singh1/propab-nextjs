"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostFeed } from "@/components/community/post-feed"
import { useQuery } from "@tanstack/react-query"

export function ProfileTabs({ userId }) {
  const [activeTab, setActiveTab] = useState("posts")

  const { data: posts } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/posts`)
      return response.json()
    },
    enabled: activeTab === "posts"
  })

  return (
    <Tabs defaultValue="posts" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="likes">Likes</TabsTrigger>
      </TabsList>
      <TabsContent value="posts">
        {posts && <PostFeed initialPosts={posts} />}
      </TabsContent>
      <TabsContent value="likes">
        {/* Implement liked posts view */}
      </TabsContent>
    </Tabs>
  )
} 