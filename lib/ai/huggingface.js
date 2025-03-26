import { HfInference } from '@huggingface/inference'
import natural from 'natural'
import sentiment from 'sentiment'

const tokenizer = new natural.WordTokenizer()
const tfidf = new natural.TfIdf()

export class AI {
  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY)
    this.sentiment = new sentiment()
  }

  async textGeneration(prompt) {
    try {
      const response = await this.hf.textGeneration({
        model: 'gpt2',
        inputs: prompt,
        parameters: {
          max_length: 100,
          temperature: 0.7,
          top_p: 0.9,
        }
      })
      return response.generated_text
    } catch (error) {
      console.error('Text generation error:', error)
      return ''
    }
  }

  async textClassification(text) {
    try {
      const response = await this.hf.textClassification({
        model: 'facebook/bart-large-mnli',
        inputs: text
      })
      return response
    } catch (error) {
      console.error('Classification error:', error)
      return []
    }
  }

  async zeroShotClassification(text, labels) {
    try {
      const response = await this.hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: text,
        parameters: { candidate_labels: labels }
      })
      return response
    } catch (error) {
      console.error('Zero-shot classification error:', error)
      return { labels: [], scores: [] }
    }
  }

  analyzeSentiment(text) {
    return this.sentiment.analyze(text)
  }

  extractKeywords(text) {
    const tokens = tokenizer.tokenize(text)
    tfidf.addDocument(tokens)
    
    const terms = {}
    tokens.forEach(term => {
      const score = tfidf.tfidf(term, 0)
      if (score > 0) {
        terms[term] = score
      }
    })

    return Object.entries(terms)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([term]) => term)
  }

  calculateReadabilityScore(text) {
    const words = text.split(' ').length
    const sentences = text.split(/[.!?]+/).length
    const syllables = this.countSyllables(text)
    
    // Flesch Reading Ease score
    return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  }

  private countSyllables(text) {
    return text.toLowerCase()
      .split(' ')
      .reduce((count, word) => {
        return count + this.countWordSyllables(word)
      }, 0)
  }

  private countWordSyllables(word) {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    
    const syllables = word.match(/[aeiouy]{1,2}/g)
    return syllables ? syllables.length : 1
  }
} 