import { AI } from "./huggingface"

export async function analyzeText(text) {
  try {
    const ai = new AI()

    const [sentiment, topics, style] = await Promise.all([
      ai.analyzeSentiment(text),
      analyzeTopics(text, ai),
      analyzeStyle(text, ai)
    ])

    return {
      sentiment: mapSentiment(sentiment.score),
      topics: topics,
      style: style.communicationStyle,
      formality: style.formality,
      complexity: style.complexity
    }
  } catch (error) {
    console.error("Error analyzing text:", error)
    return {
      sentiment: "neutral",
      topics: [],
      style: "casual",
      formality: 0.5,
      complexity: 0.5
    }
  }
}

async function analyzeTopics(text, ai) {
  const keywords = ai.extractKeywords(text)
  
  const topicLabels = [
    "technology", "business", "science", "arts",
    "personal", "professional", "academic", "social"
  ]

  const classification = await ai.zeroShotClassification(text, topicLabels)
  
  return classification.labels
    .filter((_, i) => classification.scores[i] > 0.3)
    .concat(keywords)
    .slice(0, 5)
}

async function analyzeStyle(text, ai) {
  const formalityLabels = ["formal", "casual", "professional", "friendly"]
  const formality = await ai.zeroShotClassification(text, formalityLabels)

  return {
    communicationStyle: formality.labels[0],
    formality: formality.scores[0],
    complexity: normalizeReadability(ai.calculateReadabilityScore(text))
  }
}

export function extractKeyPhrases(text) {
  const ai = new AI()
  return ai.extractKeywords(text)
}

export function calculateReadability(text) {
  const ai = new AI()
  return normalizeReadability(ai.calculateReadabilityScore(text))
}

export function identifyTone(text) {
  const ai = new AI()
  const result = ai.analyzeSentiment(text)
  return mapSentiment(result.score)
}

function mapSentiment(score) {
  if (score <= -0.5) return "negative"
  if (score >= 0.5) return "positive"
  return "neutral"
}

function normalizeReadability(score) {
  // Normalize Flesch score (0-100) to 0-1 range
  return Math.max(0, Math.min(1, score / 100))
} 