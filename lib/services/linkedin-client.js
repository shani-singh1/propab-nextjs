import { Client } from 'linkedin-api-v2'

export async function getLinkedInClient(accessToken) {
  return new Client(accessToken)
}

export async function fetchUserPosts(accessToken) {
  const client = await getLinkedInClient(accessToken)
  
  try {
    const response = await client.get('/v2/ugcPosts', {
      q: 'authors',
      authors: [`urn:li:person:${client.userInfo.id}`],
    })

    return response.elements.map(post => ({
      id: post.id,
      text: post.specificContent['com.linkedin.ugc.ShareContent'].text,
      createdAt: post.created.time,
      metrics: {
        likes: post.socialDetail.totalSocialActivityCounts.numLikes,
        comments: post.socialDetail.totalSocialActivityCounts.numComments,
      },
      platform: 'linkedin'
    }))
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error)
    throw error
  }
} 