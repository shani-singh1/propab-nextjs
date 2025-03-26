"use client"

import { useTheme } from "next-themes"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"

export function PersonalityChart({ traits }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const data = [
    { trait: "Openness", value: traits.openness || 0 },
    { trait: "Conscientiousness", value: traits.conscientiousness || 0 },
    { trait: "Extraversion", value: traits.extraversion || 0 },
    { trait: "Agreeableness", value: traits.agreeableness || 0 },
    { trait: "Neuroticism", value: traits.neuroticism || 0 },
  ]

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke={isDark ? "#374151" : "#E5E7EB"} />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fill: isDark ? "#9CA3AF" : "#4B5563" }}
          />
          <Radar
            name="Personality"
            dataKey="value"
            stroke="#2563EB"
            fill="#3B82F6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
} 