import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { uploadToCloudinary } from "@/lib/upload"
import { HuggingFaceApi } from "@/lib/huggingface"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    const type = formData.get('type')
    const partnerId = formData.get('partnerId')

    // Upload recording to cloud storage
    const recordingUrl = await uploadToCloudinary(file)

    // Initialize services
    const huggingFace = new HuggingFaceApi()

    // Analyze the recording
    const [transcript, sentiment, topics] = await Promise.all([
      type === 'voice' ? huggingFace.transcribeAudio(recordingUrl) : null,
      type === 'video' ? huggingFace.analyzeFacialExpressions(recordingUrl) : null,
      type === 'voice' ? huggingFace.extractTopics(transcript) : null
    ])

    // Save to database
    const callModel = type === 'voice' ? prisma.voiceChat : prisma.videoChat
    const call = await callModel.create({
      data: {
        userId: session.user.id,
        partnerId,
        recordingUrl,
        transcript,
        analysis: {
          sentiment,
          topics,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json(call)
  } catch (error) {
    console.error("Error handling call recording:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false
  }
} 