"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AvatarViewer } from "./avatar-viewer"
import { motion, AnimatePresence } from "framer-motion"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts"

export function EvolutionVisualizer({ userId }) {
  const [evolutionData, setEvolutionData] = useState(null)
  const [selectedTimestamp, setSelectedTimestamp] = useState(null)
  const [view, setView] = useState("3d") // "3d", "chart", "radar"

  useEffect(() => {
    loadEvolutionData()
  }, [])

  const loadEvolutionData = async () => {
    try {
      const response = await fetch(`/api/digital-twin/${userId}/evolution`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setEvolutionData(data)
      setSelectedTimestamp(data[data.length - 1].timestamp)
    } catch (error) {
      console.error("Failed to load evolution data:", error)
    }
  }

  const currentTraits = evolutionData?.find(
    d => d.timestamp === selectedTimestamp
  )?.traits

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Digital Twin Evolution</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "3d" ? "default" : "outline"}
              onClick={() => setView("3d")}
            >
              3D View
            </Button>
            <Button
              variant={view === "chart" ? "default" : "outline"}
              onClick={() => setView("chart")}
            >
              Timeline
            </Button>
            <Button
              variant={view === "radar" ? "default" : "outline"}
              onClick={() => setView("radar")}
            >
              Radar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {view === "3d" && (
            <motion.div
              key="3d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[500px]"
            >
              <AvatarViewer
                userId={userId}
                personalityTraits={currentTraits}
              />
            </motion.div>
          )}

          {view === "chart" && (
            <motion.div
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[500px]"
            >
              <LineChart width={800} height={500} data={evolutionData}>
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="traits.openness"
                  stroke="#8884d8"
                  name="Openness"
                />
                <Line
                  type="monotone"
                  dataKey="traits.conscientiousness"
                  stroke="#82ca9d"
                  name="Conscientiousness"
                />
                <Line
                  type="monotone"
                  dataKey="traits.extraversion"
                  stroke="#ffc658"
                  name="Extraversion"
                />
                <Line
                  type="monotone"
                  dataKey="traits.agreeableness"
                  stroke="#ff7300"
                  name="Agreeableness"
                />
                <Line
                  type="monotone"
                  dataKey="traits.neuroticism"
                  stroke="#ff0000"
                  name="Neuroticism"
                />
              </LineChart>
            </motion.div>
          )}

          {view === "radar" && currentTraits && (
            <motion.div
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[500px]"
            >
              <RadarChart width={800} height={500} data={[currentTraits]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Personality"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
} 