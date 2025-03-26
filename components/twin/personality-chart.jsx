"use client"

import { useEffect, useRef } from "react"
import { Chart } from "chart.js/auto"

export function PersonalityChart({ traits }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")

    const labels = Object.keys(traits)
    const data = Object.values(traits)

    chartInstance.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Personality Traits",
            data,
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            borderColor: "rgb(99, 102, 241)",
            borderWidth: 2,
            pointBackgroundColor: "rgb(99, 102, 241)",
          },
        ],
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 1,
            ticks: {
              stepSize: 0.2,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [traits])

  return (
    <div className="w-full aspect-square max-w-2xl mx-auto">
      <canvas ref={chartRef} />
    </div>
  )
} 