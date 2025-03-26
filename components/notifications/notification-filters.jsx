"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar as CalendarIcon, Search, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "SOCIAL", label: "Social" },
  { id: "INTERACTION", label: "Interactions" },
  { id: "ACHIEVEMENT", label: "Achievements" },
  { id: "LEVEL_UP", label: "Level Ups" },
  { id: "INSIGHT", label: "Insights" },
  { id: "TWIN_MATCH", label: "Twin Matches" }
]

export function NotificationFilters({ onFilter }) {
  const [search, setSearch] = useState("")
  const [selectedCategories, setSelectedCategories] = useState([])
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  })

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleFilter = () => {
    onFilter({
      search,
      categories: selectedCategories,
      dateRange
    })
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedCategories([])
    setDateRange({ from: undefined, to: undefined })
    onFilter({})
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <Badge
              key={category.id}
              variant={selectedCategories.includes(category.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleCategoryToggle(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
          <Button size="sm" onClick={handleFilter}>
            Apply filters
          </Button>
        </div>
      </div>
    </Card>
  )
} 