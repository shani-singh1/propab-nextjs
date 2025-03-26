import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { platform } = params
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/social/callback/${platform}`

    let authUrl
    switch (platform) {
      case "twitter":
        authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${
          process.env.TWITTER_CLIENT_ID
        }&response_type=code&redirect_uri=${encodeURIComponent(
          callbackUrl
        )}&scope=tweet.read%20users.read&state=${session.user.id}`
        break
      case "linkedin":
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${
          process.env.LINKEDIN_CLIENT_ID
        }&response_type=code&redirect_uri=${encodeURIComponent(
          callbackUrl
        )}&scope=r_liteprofile&state=${session.user.id}`
        break
      default:
        return new NextResponse("Platform not supported", { status: 400 })
    }

    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error("Error initiating social connection:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 