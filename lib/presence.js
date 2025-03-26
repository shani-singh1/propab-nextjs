import { Server } from 'ws'
import { getSession } from 'next-auth/react'
import { parse } from 'url'

const clients = new Map()
const userStatus = new Map()

export function initPresence(server) {
  const wss = new Server({ noServer: true })

  server.on('upgrade', async (request, socket, head) => {
    try {
      const session = await getSession({ req: request })
      if (!session) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        const userId = session.user.id
        clients.set(userId, ws)
        userStatus.set(userId, true)
        broadcastStatus(userId, true)

        ws.on('close', () => {
          clients.delete(userId)
          userStatus.set(userId, false)
          broadcastStatus(userId, false)
        })

        ws.on('pong', () => {
          userStatus.set(userId, true)
        })
      })
    } catch (error) {
      console.error('WebSocket upgrade error:', error)
      socket.destroy()
    }
  })

  // Ping clients every 30 seconds to check connection
  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.ping()
      }
    })
  }, 30000)

  return wss
}

function broadcastStatus(userId, isOnline) {
  const message = JSON.stringify({
    type: 'presence',
    userId,
    isOnline
  })

  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message)
    }
  })
}

export function getUserStatus(userId) {
  return userStatus.get(userId) || false
} 