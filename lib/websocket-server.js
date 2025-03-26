import { Server } from 'ws'
import { getSession } from 'next-auth/react'
import { parse } from 'url'

const clients = new Map()

export function initWebSocket(server) {
  const wss = new Server({ noServer: true })

  server.on('upgrade', async (request, socket, head) => {
    try {
      const { query } = parse(request.url, true)
      const session = await getSession({ req: request })

      if (!session) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        const userId = session.user.id
        clients.set(userId, ws)

        ws.on('close', () => {
          clients.delete(userId)
        })
      })
    } catch (error) {
      console.error('WebSocket upgrade error:', error)
      socket.destroy()
    }
  })

  return wss
}

export function sendNotification(userId, notification) {
  const client = clients.get(userId)
  if (client?.readyState === 1) { // WebSocket.OPEN
    client.send(JSON.stringify(notification))
  }
} 