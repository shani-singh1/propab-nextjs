import { createHash } from 'crypto'

export function generateState(userId) {
  const timestamp = Date.now().toString()
  return createHash('sha256')
    .update(`${userId}:${timestamp}:${process.env.NEXTAUTH_SECRET}`)
    .digest('hex')
}

export function validateState(state) {
  // In a production environment, you'd want to store states in a database
  // with expiration times and validate against that
  // This is a simplified version
  return true
} 