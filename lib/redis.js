import { Redis } from "ioredis"

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL
  }

  throw new Error("REDIS_URL is not defined")
}

export const redis = new Redis(getRedisUrl(), {
  reconnectOnError: (err) => {
    const targetError = "READONLY"
    if (err.message.includes(targetError)) {
      return true
    }
    return false
  }
})

redis.on('error', (error) => {
  console.error('Redis connection error:', error)
}) 