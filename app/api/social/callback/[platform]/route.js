import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { validateState } from "@/lib/oauth"
import { encrypt } from "@/lib/encryption"

async function handleTwitterCallback(code, state) {
  const userId = validateState(state)
  if (!userId) throw new Error("Invalid state")

  // Exchange code for access token
  const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.TWITTER_CALLBACK_URL,
    }),
  })

  const tokens = await tokenResponse.json()

  // Get user info
  const userResponse = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  })

  const userData = await userResponse.json()

  // Store connection
  await prisma.socialConnection.create({
    data: {
      userId,
      platform: 'twitter',
      platformId: userData.data.id,
      username: userData.data.username,
      accessToken: encrypt(tokens.access_token).toString(),
      data: userData.data,
    },
  })

  return userData.data
}

async function handleLinkedInCallback(code, state) {
  const userId = validateState(state)
  if (!userId) throw new Error("Invalid state")

  // Exchange code for access token
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.LINKEDIN_CALLBACK_URL,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
  })

  const tokens = await tokenResponse.json()

  // Get user info
  const userResponse = await fetch('https://api.linkedin.com/v2/me', {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  })

  const userData = await userResponse.json()

  // Store connection
  await prisma.socialConnection.create({
    data: {
      userId,
      platform: 'linkedin',
      platformId: userData.id,
      username: `${userData.localizedFirstName} ${userData.localizedLastName}`,
      accessToken: encrypt(tokens.access_token).toString(),
      data: userData,
    },
  })

  return userData
}

export async function GET(req, { params }) {
  try {
    const { platform } = params
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      return new NextResponse("Missing required parameters", { status: 400 })
    }

    let userData
    switch (platform) {
      case 'twitter':
        userData = await handleTwitterCallback(code, state)
        break
      case 'linkedin':
        userData = await handleLinkedInCallback(code, state)
        break
      default:
        return new NextResponse("Platform not supported", { status: 400 })
    }

    // Redirect back to profile page
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/dashboard/profile?connected=true',
      },
    })
  } catch (error) {
    console.error('Error handling OAuth callback:', error)
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/dashboard/profile?error=true',
      },
    })
  }
} 