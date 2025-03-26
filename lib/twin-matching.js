export function calculateTwinScore(userProfile, otherProfile) {
  const scores = {
    personality: comparePersonality(userProfile.traits, otherProfile.traits),
    interests: compareInterests(userProfile.interests, otherProfile.interests),
    activity: compareActivity(userProfile.activity, otherProfile.activity)
  }

  return {
    total: calculateTotalScore(scores),
    breakdown: scores
  }
}

function comparePersonality(userTraits, otherTraits) {
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
  let totalDiff = 0

  traits.forEach(trait => {
    const diff = Math.abs((userTraits[trait] || 0.5) - (otherTraits[trait] || 0.5))
    totalDiff += diff
  })

  // Convert to 0-100 score, where 0 difference = 100% match
  return Math.round((1 - totalDiff / traits.length) * 100)
}

function compareInterests(userInterests, otherInterests) {
  const userSet = new Set(userInterests)
  const otherSet = new Set(otherInterests)
  const intersection = new Set([...userSet].filter(x => otherSet.has(x)))
  const union = new Set([...userSet, ...otherSet])

  // Jaccard similarity coefficient
  return Math.round((intersection.size / union.size) * 100)
}

function compareActivity(userActivity, otherActivity) {
  // Implement activity pattern comparison logic
  // This could include posting frequency, interaction types, time patterns, etc.
  return 0 // Placeholder
}

function calculateTotalScore(scores) {
  const weights = {
    personality: 0.5,
    interests: 0.3,
    activity: 0.2
  }

  return Math.round(
    Object.entries(scores).reduce(
      (total, [key, score]) => total + score * weights[key],
      0
    )
  )
} 