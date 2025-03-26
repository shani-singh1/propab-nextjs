"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import * as d3 from "d3"

export function TwinVisualization({ traits }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!traits) return

    const width = 600
    const height = 400
    const margin = 50

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width/2}, ${height/2})`)

    // Create scales
    const radiusScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width/3])

    // Create axes
    const traitData = Object.entries(traits)
    const angleScale = d3.scaleLinear()
      .domain([0, traitData.length])
      .range([0, 2 * Math.PI])

    // Draw axes
    traitData.forEach((trait, i) => {
      const angle = angleScale(i)
      const x2 = Math.cos(angle) * width/3
      const y2 = Math.sin(angle) * width/3

      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "gray")
        .attr("stroke-width", 1)

      svg.append("text")
        .attr("x", Math.cos(angle) * (width/3 + 20))
        .attr("y", Math.sin(angle) * (width/3 + 20))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(trait[0])
    })

    // Create line generator
    const lineGenerator = d3.lineRadial()
      .angle((d, i) => angleScale(i))
      .radius(d => radiusScale(d[1]))
      .curve(d3.curveLinearClosed)

    // Draw trait polygon
    svg.append("path")
      .datum(traitData)
      .attr("d", lineGenerator)
      .attr("fill", "rgba(99, 102, 241, 0.2)")
      .attr("stroke", "rgb(99, 102, 241)")
      .attr("stroke-width", 2)

  }, [traits])

  return (
    <div className="w-full flex justify-center">
      <svg ref={svgRef} className="max-w-full h-auto" />
    </div>
  )
} 