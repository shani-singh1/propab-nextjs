import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { analyzeText } from "@/lib/services/ml-analysis"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const data = await request.json()
    
    // Validate required data
    const interests = data.interests || []
    const traits = data.traits || {}
    const socialPreferences = data.socialPreferences || {
      connectionStyle: 'balanced',
      communicationFrequency: 'moderate',
      interactionType: 'mixed'
    }

    // Validate data types
    if (!Array.isArray(interests)) {
      return new Response(
        JSON.stringify({ error: "Interests must be an array" }),
        { status: 400 }
      )
    }

    if (typeof traits !== 'object' || traits === null) {
      return new Response(
        JSON.stringify({ error: "Traits must be an object" }),
        { status: 400 }
      )
    }

    if (typeof socialPreferences !== 'object' || socialPreferences === null) {
      return new Response(
        JSON.stringify({ error: "Social preferences must be an object" }),
        { status: 400 }
      )
    }

    // Combine all text for analysis
    const analysisText = [
      ...interests,
      ...Object.entries(traits).map(([trait, value]) => `${trait}: ${value}`),
      ...Object.entries(socialPreferences).map(([pref, value]) => `${pref}: ${value}`)
    ].filter(Boolean).join('. ')

    // Analyze personality in the background
    let analysis = { labels: ['neutral'], scores: [1.0] }
    try {
      if (analysisText.length > 0) {
        analysis = await analyzeText(analysisText)
      }
    } catch (error) {
      console.error('Error analyzing text:', error)
      // Continue with default analysis
    }

    // Create or update profile
    const profile = await prisma.personalityProfile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        interests,
        traits,
        focusAreas: ['skills', 'interests', 'goals'], // Default focus areas
        activeHours: {
          start: socialPreferences.communicationFrequency === 'high' ? 8 : 9,
          end: socialPreferences.communicationFrequency === 'high' ? 22 : 18,
        },
      },
      create: {
        userId: session.user.id,
        interests,
        traits,
        focusAreas: ['skills', 'interests', 'goals'], // Default focus areas
        activeHours: {
          start: socialPreferences.communicationFrequency === 'high' ? 8 : 9,
          end: socialPreferences.communicationFrequency === 'high' ? 22 : 18,
        },
      },
    })

    return Response.json({
      success: true,
      profile,
      analysis: analysis.labels?.[0] || 'neutral'
    })
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return new Response(
      JSON.stringify({
        error: "Failed to complete onboarding",
        details: error.message
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 