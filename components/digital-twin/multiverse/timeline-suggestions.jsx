"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  ArrowRight,
  Check,
  Lightbulb,
  Compass
} from "lucide-react"

export function TimelineSuggestions({ memory, onSelect }) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)

  useEffect(() => {
    if (memory) loadSuggestions()
  }, [memory])

  const loadSuggestions = async () => {
    try {
      const response = await fetch(
        `/api/digital-twin/suggestions?memoryId=${memory.id}`
      )
      if (!response.ok) throw new Error()
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error("Failed to load suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (suggestion) => {
    setSelectedSuggestion(suggestion)
    onSelect?.(suggestion)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            <h3 className="font-semibold">AI Suggestions</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            Based on your personality and experiences
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1,
                y: 0,
                transition: { delay: index * 0.1 }
              }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  selectedSuggestion?.title === suggestion.title
                    ? "border-primary bg-accent"
                    : "hover:border-primary/50"
                }`}
                onClick={() => handleSelect(suggestion)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          {Math.round(suggestion.alignment * 100)}% Match
                        </div>
                        <Compass className="h-4 w-4 text-primary" />
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-sm font-medium mb-1">
                        Alignment with your profile
                      </div>
                      <Progress
                        value={suggestion.alignment * 100}
                        className="h-1.5"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      {Object.entries(suggestion.variables).map(([key, value]) => (
                        <div
                          key={key}
                          className="px-2 py-1 bg-muted rounded-lg text-xs"
                        >
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 