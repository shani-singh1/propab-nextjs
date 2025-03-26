import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { ChatWindow } from "@/components/chat/chat-window"
import { ChatList } from "@/components/chat/chat-list"
import prisma from "@/lib/prisma"

export default async function ChatPage({ params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const chat = await prisma.chat.findFirst({
    where: {
      id: params.chatId,
      userIds: {
        has: session.user.id
      }
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  })

  if (!chat) {
    redirect("/chat")
  }

  const otherUser = chat.users.find(user => user.id !== session.user.id)

  return (
    <div className="container py-6">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <ChatList
          currentUserId={session.user.id}
          selectedChatId={params.chatId}
        />
        <ChatWindow
          chatId={params.chatId}
          currentUser={session.user}
          otherUser={otherUser}
        />
      </div>
    </div>
  )
} 