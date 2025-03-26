import { useState } from "react"
import { trackAction } from "@/lib/utils/track-action"

export function InteractionAnalyzer({ userId, interaction }) {
  const handleAnalysisComplete = async (results) => {
    // Track analysis completion for gamification
    await trackAction(userId, "ANALYSIS", {
      type: interaction.type,
      quality: results.confidence,
      insights: results.insights.length
    })

    setAnalysisResults(results)
  }
} 