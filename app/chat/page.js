import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { ChatList } from "@/components/chat/chat-list"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default async function ChatIndexPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="container py-6">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <ChatList currentUserId={session.user.id} />
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Select a chat</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Choose a conversation from the list to start chatting
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 