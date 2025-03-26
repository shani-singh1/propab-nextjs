import { TwitterApi } from 'twitter-api-v2'

export async function getTwitterClient(accessToken) {
  return new TwitterApi(accessToken)
}

export async function fetchUserTweets(accessToken, maxResults = 100) {
  const client = await getTwitterClient(accessToken)
  
  try {
    const tweets = await client.v2.userTimeline({
      max_results: maxResults,
      'tweet.fields': ['created_at', 'public_metrics', 'text'],
    })

    return tweets.data.data.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at,
      metrics: tweet.public_metrics,
      platform: 'twitter'
    }))
  } catch (error) {
    console.error('Error fetching tweets:', error)
    throw error
  }
} 