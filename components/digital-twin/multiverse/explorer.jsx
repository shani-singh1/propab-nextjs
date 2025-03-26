"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { TimelineVisualizer } from "./timeline-visualizer"
import { TimelineComparison } from "./timeline-comparison"
import { ImpactAnalysis } from "./impact-analysis"
import { NewTimelineModal } from "./new-timeline-modal"
import { 
  GitBranch, 
  Sparkles, 
  Scale, 
  Compass,
  Plus,
  Search
} from "lucide-react"

export function MultiverseExplorer({ userId }) {
  const [timelines, setTimelines] = useState([])
  const [selectedTimeline, setSelectedTimeline] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState("timelines") // timelines, comparison, impact
  const [isNewTimelineModalOpen, setIsNewTimelineModalOpen] = useState(false)
  const [relatedTimelines, setRelatedTimelines] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    loadTimelines()
  }, [])

  const loadTimelines = async () => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}/timelines`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setTimelines(data)
    } catch (error) {
      toast.error("Failed to load timelines")
    }
  }

  const createNewTimeline = async (memoryId, variables) => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}/timelines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoryId, variables })
      })

      if (!response.ok) throw new Error()
      
      const newTimeline = await response.json()
      setTimelines(prev => [...prev, newTimeline])
      toast.success("New timeline created")
    } catch (error) {
      toast.error("Failed to create timeline")
    }
  }

  const filteredTimelines = timelines.filter(timeline =>
    timeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    timeline.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const loadRelatedTimelines = async (timeline) => {
    try {
      const response = await fetch(
        `/api/digital-twin/${userId}/timelines/related?timelineId=${timeline.id}`
      )
      if (!response.ok) throw new Error()
      const data = await response.json()
      setRelatedTimelines(data)
    } catch (error) {
      console.error("Failed to load related timelines:", error)
    }
  }

  const handleTimelineSelect = (timeline) => {
    setSelectedTimeline(timeline)
    loadRelatedTimelines(timeline)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Multiverse Explorer</h2>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search timelines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                leftIcon={<Search className="h-4 w-4" />}
              />
              <Button onClick={() => setView("timelines")}>
                <GitBranch className="h-4 w-4 mr-2" />
                Timelines
              </Button>
              <Button onClick={() => setView("comparison")}>
                <Scale className="h-4 w-4 mr-2" />
                Compare
              </Button>
              <Button onClick={() => setView("impact")}>
                <Compass className="h-4 w-4 mr-2" />
                Impact
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {view === "timelines" && (
              <motion.div
                key="timelines"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-3 gap-4">
                  {filteredTimelines.map((timeline) => (
                    <TimelineCard
                      key={timeline.id}
                      timeline={timeline}
                      onClick={() => handleTimelineSelect(timeline)}
                    />
                  ))}
                  <Button
                    variant="outline"
                    className="h-40 border-dashed"
                    onClick={() => setIsNewTimelineModalOpen(true)}
                  >
                    <Plus className="h-6 w-6 mr-2" />
                    Create New Timeline
                  </Button>
                </div>
              </motion.div>
            )}

            {view === "comparison" && selectedTimeline && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TimelineComparison timeline={selectedTimeline} />
              </motion.div>
            )}

            {view === "impact" && selectedTimeline && (
              <motion.div
                key="impact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ImpactAnalysis timeline={selectedTimeline} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {selectedTimeline && (
        <TimelineVisualizer
          timeline={selectedTimeline}
          relatedTimelines={relatedTimelines}
          onClose={() => setSelectedTimeline(null)}
        />
      )}

      <NewTimelineModal
        isOpen={isNewTimelineModalOpen}
        onClose={() => setIsNewTimelineModalOpen(false)}
        onCreateTimeline={createNewTimeline}
      />
    </div>
  )
}

function TimelineCard({ timeline, onClick }) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{timeline.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {timeline.description}
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span>{Math.round(timeline.probability * 100)}% likely</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              <span>Impact: {Math.round(timeline.impact * 10)}/10</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 