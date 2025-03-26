"use client"

import { useEffect, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { useTheme } from "next-themes"

export function TwinVisualization({ personality, interests }) {
  const graphRef = useRef()
  const { theme } = useTheme()
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })

  useEffect(() => {
    if (!personality || !interests) return

    const nodes = [
      { id: "center", group: "core", label: "Digital Twin" },
      ...Object.entries(personality).map(([trait, value]) => ({
        id: trait,
        group: "personality",
        label: trait,
        value: value,
      })),
      ...interests.map(interest => ({
        id: interest,
        group: "interest",
        label: interest,
      })),
    ]

    const links = [
      ...Object.keys(personality).map(trait => ({
        source: "center",
        target: trait,
        value: personality[trait],
      })),
      ...interests.map(interest => ({
        source: "center",
        target: interest,
        value: 1,
      })),
    ]

    setGraphData({ nodes, links })
  }, [personality, interests])

  return (
    <div className="h-[500px] border rounded-lg overflow-hidden">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeColor={node => {
          switch (node.group) {
            case "core": return "#3B82F6"
            case "personality": return "#8B5CF6"
            case "interest": return "#EC4899"
            default: return "#6B7280"
          }
        }}
        nodeLabel={node => node.label}
        linkWidth={link => link.value * 2}
        linkColor={() => theme === "dark" ? "#4B5563" : "#D1D5DB"}
        backgroundColor={theme === "dark" ? "#1F2937" : "#FFFFFF"}
      />
    </div>
  )
} 