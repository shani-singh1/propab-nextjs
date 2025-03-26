import { decrypt } from "@/lib/encryption"
import { analyzeTextWithAI } from "./ai-analysis"
import natural from 'natural'
import { fetchUserTweets } from "./twitter-client"
import { fetchUserPosts } from "./linkedin-client"

const sentiment = new natural.SentimentAnalyzer()
const tokenizer = new natural.WordTokenizer()

export async function analyzeSocialData(connection) {
  const accessToken = decrypt(connection.accessToken)
  let posts = []

  try {
    switch (connection.platform) {
      case 'twitter':
        posts = await fetchUserTweets(accessToken)
        break
      case 'linkedin':
        posts = await fetchUserPosts(accessToken)
        break
    }

    const analysis = await analyzeContent(posts)
    return analysis
  } catch (error) {
    console.error(`Error analyzing ${connection.platform} data:`, error)
    throw error
  }
}

async function analyzeContent(posts) {
  const combinedText = posts.map(p => p.text).join('\n')
  
  // Get AI analysis
  const aiAnalysis = await analyzeTextWithAI(combinedText)
  
  // Calculate sentiment
  const sentimentScore = calculateSentiment(posts)
  
  // Calculate engagement
  const engagement = calculateEngagement(posts)
  
  // Extract topics
  const topics = extractTopics(posts)

  return {
    sentiment: sentimentScore,
    topics: topics,
    engagement: engagement,
    personality: aiAnalysis.personality
  }
}

function calculateSentiment(posts) {
  const scores = posts.map(post => {
    const tokens = tokenizer.tokenize(post.text)
    return sentiment.getSentiment(tokens)
  })

  return scores.reduce((a, b) => a + b, 0) / scores.length
}

function calculateEngagement(posts) {
  const metrics = posts.map(post => {
    if (post.platform === 'twitter') {
      return {
        likes: post.metrics.like_count || 0,
        retweets: post.metrics.retweet_count || 0,
        replies: post.metrics.reply_count || 0
      }
    } else {
      return {
        likes: post.metrics.likes || 0,
        comments: post.metrics.comments || 0
      }
    }
  })

  const total = metrics.reduce((acc, curr) => {
    Object.keys(curr).forEach(key => {
      acc[key] = (acc[key] || 0) + curr[key]
    })
    return acc
  }, {})

  const average = Object.keys(total).reduce((acc, key) => {
    acc[key] = total[key] / metrics.length
    return acc
  }, {})

  return {
    total,
    average: Object.values(average).reduce((a, b) => a + b, 0) / Object.values(average).length
  }
}

function extractTopics(posts) {
  const tfidf = new natural.TfIdf()
  
  posts.forEach(post => {
    tfidf.addDocument(post.text)
  })

  const topics = {}
  tfidf.listTerms(0).slice(0, 10).forEach(item => {
    topics[item.term] = item.tfidf
  })

  return topics
} 