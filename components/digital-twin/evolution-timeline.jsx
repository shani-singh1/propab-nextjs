"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function EvolutionTimeline({ userId }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvolutionData() {
      try {
        const response = await fetch(`/api/digital-twin/${userId}/evolution`)
        const evolutionData = await response.json()
        setData(evolutionData)
      } catch (error) {
        console.error("Error fetching evolution data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvolutionData()
  }, [userId])

  if (loading) {
    return <LoadingState />
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Twin Evolution</h2>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 