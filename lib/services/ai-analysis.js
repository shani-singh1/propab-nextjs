const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"

export async function analyzeTextWithAI(text) {
  try {
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          candidate_labels: [
            "technology", "business", "creative", "analytical", 
            "leadership", "communication", "innovation", "teamwork"
          ]
        }
      })
    })

    const result = await response.json()
    
    // Convert scores to personality traits
    const traits = result.labels.reduce((acc, label, index) => {
      acc[label] = result.scores[index]
      return acc
    }, {})

    return {
      personality: {
        traits,
        communication_style: inferCommunicationStyle(traits),
        interests: result.labels.filter((_, i) => result.scores[i] > 0.5)
      }
    }
  } catch (error) {
    console.error('Error analyzing text with Hugging Face:', error)
    throw error
  }
}

function inferCommunicationStyle(traits) {
  // Simple logic to infer communication style from traits
  if (traits.analytical > 0.6) return "Precise and data-driven"
  if (traits.creative > 0.6) return "Imaginative and expressive"
  if (traits.leadership > 0.6) return "Authoritative and clear"
  return "Balanced and adaptable"
} 