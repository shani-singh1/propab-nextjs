const TRAIT_DESCRIPTIONS = {
  openness: {
    high: "You have a strong appreciation for new experiences, ideas, and creativity. You're likely to be curious, imaginative, and open to unconventional perspectives.",
    moderate: "You maintain a good balance between tradition and innovation. While you're open to new experiences, you also value familiar routines.",
    low: "You prefer familiar routines and concrete, practical matters. You likely value tradition and appreciate clear, straightforward approaches."
  },
  conscientiousness: {
    high: "You're highly organized, responsible, and goal-oriented. You plan ahead and pay attention to details, making you reliable and thorough in your work.",
    moderate: "You maintain a healthy balance between organization and flexibility. You can be methodical when needed but also adapt to changing situations.",
    low: "You prefer spontaneity and flexibility over rigid planning. You might find creative solutions through your more relaxed approach to tasks."
  },
  extraversion: {
    high: "You're energized by social interactions and enjoy being around others. You're likely outgoing, enthusiastic, and comfortable taking charge in group situations.",
    moderate: "You can adapt well to both social and solitary situations. You enjoy company while also valuing your personal space and quiet time.",
    low: "You prefer deeper one-on-one connections and quiet environments. You're likely thoughtful and observant, processing experiences internally."
  },
  agreeableness: {
    high: "You're naturally cooperative and considerate of others' feelings. You strive for harmony in relationships and are often seen as supportive and trustworthy.",
    moderate: "You balance cooperation with self-advocacy. You can be both supportive and assertive, depending on the situation.",
    low: "You're direct and straightforward in your approach. You prioritize objective truth over emotional comfort and might be seen as frank or assertive."
  },
  neuroticism: {
    high: "You're emotionally sensitive and deeply aware of your feelings. While this can mean experiencing stress more intensely, it also allows for deep emotional connections.",
    moderate: "You maintain emotional stability while still being in touch with your feelings. You can handle stress while remaining sensitive to emotional nuances.",
    low: "You're emotionally stable and resilient to stress. You tend to stay calm under pressure and maintain a steady mood."
  }
}

export function generatePersonalityInsights(traits) {
  const insights = []
  
  for (const [trait, value] of Object.entries(traits)) {
    let level
    if (value >= 0.7) level = "high"
    else if (value <= 0.3) level = "low"
    else level = "moderate"

    insights.push({
      trait,
      level,
      description: TRAIT_DESCRIPTIONS[trait][level]
    })
  }

  return insights
}

export function generateCompatibilityScore(traits1, traits2) {
  const weights = {
    openness: 0.2,
    conscientiousness: 0.2,
    extraversion: 0.2,
    agreeableness: 0.2,
    neuroticism: 0.2
  }

  let totalScore = 0
  let totalWeight = 0

  for (const trait in weights) {
    if (traits1[trait] && traits2[trait]) {
      const difference = Math.abs(traits1[trait] - traits2[trait])
      const score = 1 - difference // Convert difference to similarity (0-1)
      totalScore += score * weights[trait]
      totalWeight += weights[trait]
    }
  }

  return Math.round((totalScore / totalWeight) * 100)
}

export function generateCompatibilityInsights(traits1, traits2) {
  const insights = []

  for (const trait in traits1) {
    if (traits2[trait]) {
      const difference = Math.abs(traits1[trait] - traits2[trait])
      
      if (difference <= 0.2) {
        insights.push({
          trait,
          type: "similarity",
          description: `You both share similar levels of ${trait}, which can lead to mutual understanding and harmony in this aspect.`
        })
      } else if (difference >= 0.6) {
        insights.push({
          trait,
          type: "complement",
          description: `Your different levels of ${trait} could provide balance and complement each other's strengths.`
        })
      }
    }
  }

  return insights
} 