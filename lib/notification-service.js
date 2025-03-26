import { sendNotification } from "./send-notification"
import prisma from "@/lib/prisma"
import { EmailService } from "./email-service"

export const NotificationService = {
  // Social Interactions
  async shouldNotify(userId, type) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true }
    })

    const preferences = user?.notificationPreferences ?? {}
    return preferences[type] ?? true
  },

  async notifyNewFollower(userId, followerName) {
    if (!(await this.shouldNotify(userId, "social"))) return
    return sendNotification({
      userId,
      type: "SOCIAL",
      title: "New Follower",
      message: `${followerName} started following you`
    })
  },

  async notifyPostLike(userId, likerName, postPreview) {
    return sendNotification({
      userId,
      type: "INTERACTION",
      title: "New Like",
      message: `${likerName} liked your post: "${postPreview}"`
    })
  },

  async notifyNewComment(userId, commenterName, postPreview) {
    return sendNotification({
      userId,
      type: "INTERACTION",
      title: "New Comment",
      message: `${commenterName} commented on your post: "${postPreview}"`
    })
  },

  // Achievements & Levels
  async notifyLevelUp(userId, newLevel, title) {
    return sendNotification({
      userId,
      type: "LEVEL_UP",
      title: "Level Up!",
      message: `You've reached Level ${newLevel}: ${title}`
    })
  },

  async notifyAchievement(userId, achievementName, description) {
    return sendNotification({
      userId,
      type: "ACHIEVEMENT",
      title: "Achievement Unlocked!",
      message: `${achievementName} - ${description}`
    })
  },

  // Twin Insights
  async notifyPersonalityInsight(userId, insight) {
    return sendNotification({
      userId,
      type: "INSIGHT",
      title: "New Personality Insight",
      message: insight
    })
  },

  async notifyTwinMatch(userId, matchName, similarity) {
    return sendNotification({
      userId,
      type: "TWIN_MATCH",
      title: "New Digital Twin Match",
      message: `Found a ${similarity}% match with ${matchName}`
    })
  },

  async notifyTwinRequest(userId, requesterName, matchScore) {
    return sendNotification({
      userId,
      type: "TWIN_REQUEST",
      title: "New Twin Connection Request",
      message: `${requesterName} wants to connect! You have a ${matchScore}% match.`
    })
  },

  async notifyTwinRequestAccepted(userId, accepterName) {
    return sendNotification({
      userId,
      type: "TWIN_REQUEST_ACCEPTED",
      title: "Twin Connection Accepted",
      message: `${accepterName} accepted your twin connection request!`
    })
  },

  async sendGroupedEmails() {
    // Get all users with unread notifications
    const users = await prisma.user.findMany({
      where: {
        notifications: {
          some: {
            read: false,
            emailSent: false
          }
        }
      },
      include: {
        notifications: {
          where: {
            read: false,
            emailSent: false
          }
        }
      }
    })

    // Send emails and mark notifications as emailed
    for (const user of users) {
      if (user.notificationPreferences?.emailEnabled !== false) {
        await EmailService.sendNotificationEmail(user, user.notifications)

        // Mark notifications as emailed
        await prisma.notification.updateMany({
          where: {
            id: {
              in: user.notifications.map(n => n.id)
            }
          },
          data: {
            emailSent: true
          }
        })
      }
    }
  },

  async notifyNewMessage(userId, senderName, messagePreview) {
    if (!(await this.shouldNotify(userId, "chat"))) return

    return sendNotification({
      userId,
      type: "CHAT",
      title: "New Message",
      message: `${senderName}: ${messagePreview}`
    })
  },

  async notifyUserOnline(userId, userName) {
    if (!(await this.shouldNotify(userId, "presence"))) return

    return sendNotification({
      userId,
      type: "PRESENCE",
      title: "User Online",
      message: `${userName} is now online`
    })
  }
} 