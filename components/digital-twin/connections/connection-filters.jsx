"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

export function ConnectionFilters({ userId }) {
  const [filters, setFilters] = useState({
    quality: true,
    engagement: true,
    recent: false,
    synergy: false
  })

  const handleFilterChange = (key) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={filters.quality}
          onCheckedChange={() => handleFilterChange("quality")}
        >
          Quality Score
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.engagement}
          onCheckedChange={() => handleFilterChange("engagement")}
        >
          Engagement Level
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.recent}
          onCheckedChange={() => handleFilterChange("recent")}
        >
          Most Recent
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.synergy}
          onCheckedChange={() => handleFilterChange("synergy")}
        >
          Synergy Score
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 