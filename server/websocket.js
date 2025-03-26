import { Server } from "socket.io"
import { createServer } from "http"
import { parse } from "url"
import { verify } from "jsonwebtoken"

export function createWebSocketServer(httpServer) {
  const io = new Server(httpServer, {
    path: "/ws",
    cors: {
      origin: process.env.NEXTAUTH_URL,
      methods: ["GET", "POST"]
    }
  })

  // Authenticate WebSocket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error("Authentication error"))
    }

    try {
      const decoded = verify(token, process.env.NEXTAUTH_SECRET)
      socket.userId = decoded.sub
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  // Handle connections
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`)

    // Store user's socket ID
    socket.join(socket.userId)

    // Handle call requests
    socket.on("call-request", (data) => {
      socket.to(data.to).emit("call-request", {
        from: socket.userId,
        type: data.type,
        offer: data.offer
      })
    })

    // Handle call acceptance
    socket.on("call-accepted", (data) => {
      socket.to(data.to).emit("call-accepted", {
        from: socket.userId,
        answer: data.answer
      })
    })

    // Handle ICE candidates
    socket.on("ice-candidate", (data) => {
      socket.to(data.to).emit("ice-candidate", {
        from: socket.userId,
        candidate: data.candidate
      })
    })

    // Handle call end
    socket.on("call-end", (data) => {
      socket.to(data.to).emit("call-ended", {
        from: socket.userId
      })
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`)
    })
  })

  return io
} 