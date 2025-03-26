import prisma from "@/lib/prisma"
import { sendNotification as sendWebSocketNotification } from "./websocket-server"

export async function sendNotification({ userId, type, title, message }) {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId
      }
    })

    // Send real-time notification via WebSocket
    sendWebSocketNotification(userId, notification)

    return notification
  } catch (error) {
    console.error("Error sending notification:", error)
    throw error
  }
} 