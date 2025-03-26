"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Move, X } from "lucide-react"

export function TimelineGraph({ timeline, relatedTimelines }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [isPanning, setIsPanning] = useState(false)
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })
  const [selectedNode, setSelectedNode] = useState(null)

  useEffect(() => {
    if (!timeline || !containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = 400
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove()

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        const { transform } = event
        setTransform({ x: transform.x, y: transform.y, k: transform.k })
        svg.selectAll("g").attr("transform", transform)
      })

    svg.call(zoom)

    // Add pan behavior
    if (isPanning) {
      svg.on("mousedown.zoom", null)
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null)
        .call(d3.drag().on("drag", (event) => {
          const { dx, dy } = event
          setTransform(prev => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy
          }))
          svg.selectAll("g")
            .attr("transform", `translate(${transform.x},${transform.y})`)
        }))
    }

    // Create timeline data structure
    const timelineData = {
      id: "present",
      children: [
        {
          id: timeline.id,
          name: timeline.name,
          probability: timeline.probability,
          children: Object.entries(timeline.predictions).map(([key, value]) => ({
            id: key,
            name: key,
            description: value
          }))
        },
        ...(relatedTimelines || []).map(t => ({
          id: t.id,
          name: t.name,
          probability: t.probability,
          children: Object.entries(t.predictions).map(([key, value]) => ({
            id: key,
            name: key,
            description: value
          }))
        }))
      ]
    }

    // Create tree layout
    const treeLayout = d3.tree()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2))

    const root = d3.hierarchy(timelineData)
    const tree = treeLayout(root)

    // Create links
    const links = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .selectAll(".link")
      .data(tree.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
      )
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2)

    // Create nodes
    const nodes = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .selectAll(".node")
      .data(tree.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)

    // Add node circles
    nodes.append("circle")
      .attr("r", 6)
      .attr("fill", d => {
        if (d.data.id === "present") return "#94a3b8"
        if (d.data.id === timeline.id) return "#3b82f6"
        return "#e2e8f0"
      })

    // Add node labels
    nodes.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -8 : 8)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .attr("class", "text-sm text-muted-foreground")
      .attr("fill", "currentColor")

    // Add probability indicators
    nodes.filter(d => d.data.probability)
      .append("text")
      .attr("dy", "-1em")
      .attr("x", 8)
      .attr("text-anchor", "start")
      .text(d => `${Math.round(d.data.probability * 100)}%`)
      .attr("class", "text-xs text-muted-foreground")
      .attr("fill", "currentColor")

    // Add tooltips
    nodes.filter(d => d.data.description)
      .append("title")
      .text(d => d.data.description)

    // Make nodes interactive
    nodes
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", (d) => `translate(${d.y},${d.x}) scale(1.2)`)
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", (d) => `translate(${d.y},${d.x}) scale(1)`)
      })
      .on("click", (event, d) => {
        if (d.data.description) {
          setSelectedNode(d.data)
        }
      })

  }, [timeline, relatedTimelines, isPanning])

  const handleZoom = (delta) => {
    const newScale = Math.max(0.5, Math.min(2, transform.k + delta))
    setTransform(prev => ({ ...prev, k: newScale }))
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(
        d3.zoom().transform,
        d3.zoomIdentity.translate(transform.x, transform.y).scale(newScale)
      )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">Timeline Visualization</div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(0.1)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(-0.1)}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant={isPanning ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPanning(!isPanning)}
          >
            <Move className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="w-full">
        <motion.svg
          ref={svgRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        />
      </div>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 bg-background border rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{selectedNode.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedNode.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
} 