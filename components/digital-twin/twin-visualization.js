"use client"

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export function TwinVisualization({ traits = {} }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || Object.keys(traits).length === 0) return

    const width = 400
    const height = 400
    const radius = Math.min(width, height) / 2 - 40

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width/2},${height/2})`)

    // Convert traits to array for D3
    const data = Object.entries(traits).map(([key, value]) => ({
      trait: key,
      value: value * 100 // Convert to percentage
    }))

    // Create scales
    const angleScale = d3.scaleLinear()
      .domain([0, data.length])
      .range([0, 2 * Math.PI])

    const radiusScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, radius])

    // Create line generator
    const line = d3.lineRadial()
      .angle((d, i) => angleScale(i))
      .radius(d => radiusScale(d.value))
      .curve(d3.curveLinearClosed)

    // Draw the web
    svg.selectAll(".web-line")
      .data(d3.range(10, 110, 20))
      .join("circle")
      .attr("class", "web-line")
      .attr("r", d => radiusScale(d))
      .attr("fill", "none")
      .attr("stroke", "rgba(0,0,0,0.1)")

    // Draw the axes
    svg.selectAll(".axis")
      .data(data)
      .join("line")
      .attr("class", "axis")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => radius * Math.cos(angleScale(i) - Math.PI/2))
      .attr("y2", (d, i) => radius * Math.sin(angleScale(i) - Math.PI/2))
      .attr("stroke", "rgba(0,0,0,0.2)")

    // Draw the trait labels
    svg.selectAll(".trait-label")
      .data(data)
      .join("text")
      .attr("class", "trait-label")
      .attr("x", (d, i) => (radius + 20) * Math.cos(angleScale(i) - Math.PI/2))
      .attr("y", (d, i) => (radius + 20) * Math.sin(angleScale(i) - Math.PI/2))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text(d => d.trait)
      .style("font-size", "12px")

    // Draw the trait values
    svg.append("path")
      .datum(data)
      .attr("class", "trait-values")
      .attr("d", line)
      .attr("fill", "rgba(59, 130, 246, 0.5)")
      .attr("stroke", "rgb(59, 130, 246)")
      .attr("stroke-width", 2)

    // Add dots at data points
    svg.selectAll(".trait-dot")
      .data(data)
      .join("circle")
      .attr("class", "trait-dot")
      .attr("cx", (d, i) => radiusScale(d.value) * Math.cos(angleScale(i) - Math.PI/2))
      .attr("cy", (d, i) => radiusScale(d.value) * Math.sin(angleScale(i) - Math.PI/2))
      .attr("r", 4)
      .attr("fill", "rgb(59, 130, 246)")

  }, [traits])

  return (
    <div className="aspect-square w-full flex items-center justify-center bg-white rounded-lg p-4">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  )
} 