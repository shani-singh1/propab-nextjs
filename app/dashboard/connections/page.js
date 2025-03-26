import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { ConnectionsList } from "@/components/digital-twin/connections/connections-list"
import { ConnectionSuggestions } from "@/components/digital-twin/connections/connection-suggestions"
import { ConnectionFilters } from "@/components/digital-twin/connections/connection-filters"

export default async function ConnectionsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Connections</h1>
        <ConnectionFilters userId={session.user.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConnectionsList userId={session.user.id} />
        <ConnectionSuggestions userId={session.user.id} />
      </div>
    </div>
  )
} 