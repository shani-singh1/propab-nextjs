import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function analyzeText(text) {
  try {
    // First check if we have a valid API key
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.warn('No Hugging Face API key provided')
      return {
        labels: ['neutral'],
        scores: [1.0]
      }
    }

    const response = await hf.textClassification({
      model: 'SamLowe/roberta-base-go_emotions',
      inputs: text,
    })

    return response
  } catch (error) {
    console.error('Error in text analysis:', error)
    // Return a fallback response if the API call fails
    return {
      labels: ['neutral'],
      scores: [1.0]
    }
  }
}

export async function analyzeSentiment(text) {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      return { sentiment: 'neutral', score: 0.5 }
    }

    const response = await hf.textClassification({
      model: 'nlptown/bert-base-multilingual-uncased-sentiment',
      inputs: text,
    })

    return {
      sentiment: response[0].label,
      score: response[0].score
    }
  } catch (error) {
    console.error('Error in sentiment analysis:', error)
    return { sentiment: 'neutral', score: 0.5 }
  }
} 