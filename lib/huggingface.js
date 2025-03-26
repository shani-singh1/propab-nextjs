export class HuggingFaceApi {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY
    this.baseUrl = "https://api-inference.huggingface.co/models"
  }

  async analyzeSentiment(text) {
    const response = await this.query(
      "finiteautomata/bertweet-base-sentiment-analysis",
      { inputs: text }
    )
    return this.normalizeSentimentScore(response[0])
  }

  async extractTopics(text) {
    const response = await this.query(
      "facebook/bart-large-mnli",
      {
        inputs: text,
        parameters: {
          candidate_labels: [
            "technology", "business", "politics", "entertainment",
            "health", "science", "sports", "travel", "education",
            "personal", "relationships", "lifestyle"
          ]
        }
      }
    )
    return this.filterRelevantTopics(response)
  }

  async summarize(text) {
    const response = await this.query(
      "facebook/bart-large-cnn",
      { inputs: text }
    )
    return response[0].summary_text
  }

  async analyzeEmotion(text) {
    const response = await this.query(
      "j-hartmann/emotion-english-distilroberta-base",
      { inputs: text }
    )
    return this.normalizeEmotionScores(response[0])
  }

  async transcribeAudio(audioUrl) {
    const response = await this.query(
      "facebook/wav2vec2-base-960h",
      { inputs: audioUrl }
    )
    return response.text
  }

  async analyzeFacialExpressions(imageUrl) {
    const response = await this.query(
      "microsoft/face-detection-and-analysis",
      { inputs: imageUrl }
    )
    return this.normalizeFacialAnalysis(response)
  }

  private async query(model, payload) {
    const response = await fetch(`${this.baseUrl}/${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`)
    }

    return response.json()
  }

  private normalizeSentimentScore(result) {
    // Convert sentiment labels to numeric scores
    const sentimentMap = {
      "POSITIVE": 1,
      "NEUTRAL": 0,
      "NEGATIVE": -1
    }
    return sentimentMap[result.label] * result.score
  }

  private filterRelevantTopics(result) {
    // Return topics with confidence above threshold
    const threshold = 0.3
    return result.labels
      .filter(label => result.scores[label] > threshold)
      .map(label => ({
        topic: label,
        confidence: result.scores[label]
      }))
  }

  private normalizeEmotionScores(result) {
    return Object.fromEntries(
      Object.entries(result).map(([emotion, score]) => [
        emotion.toLowerCase(),
        parseFloat(score)
      ])
    )
  }

  private normalizeFacialAnalysis(result) {
    return {
      emotions: result.emotions,
      attention: result.attention_score,
      engagement: result.engagement_score
    }
  }
} 