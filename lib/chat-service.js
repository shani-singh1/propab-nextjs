import { clients } from "./presence"

export const ChatService = {
  sendTypingStatus(userId, chatId, isTyping) {
    const message = JSON.stringify({
      type: "typing",
      userId,
      chatId,
      isTyping
    })

    // Send to all users in the chat
    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message)
      }
    })
  },

  sendReadReceipt(userId, chatId, messageId) {
    const message = JSON.stringify({
      type: "read_receipt",
      userId,
      chatId,
      messageId
    })

    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message)
      }
    })
  }
} 