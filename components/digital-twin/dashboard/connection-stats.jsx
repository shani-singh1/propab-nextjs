"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Users, UserPlus, UserCheck } from "lucide-react"

export function ConnectionStats({ user }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Connection Stats</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Total</span>
            </div>
            <p className="text-2xl font-bold">{user.connections.length}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Pending</span>
            </div>
            <p className="text-2xl font-bold">
              {user.connections.filter(c => c.status === 'PENDING').length}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Active</span>
            </div>
            <p className="text-2xl font-bold">
              {user.connections.filter(c => c.status === 'ACTIVE').length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 