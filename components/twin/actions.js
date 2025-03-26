"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, RefreshCw, Share2 } from "lucide-react"
import Link from "next/link"

export function TwinActions({ hasPersonality, socialCount }) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex"
        disabled={!hasPersonality}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Twin
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex"
        asChild
      >
        <Link href="/dashboard/profile">
          <RefreshCw className="w-4 h-4 mr-2" />
          Update Profile
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">Update Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!hasPersonality}>
            Share Twin
          </DropdownMenuItem>
          <DropdownMenuItem disabled={socialCount === 0}>
            Analyze Social Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 