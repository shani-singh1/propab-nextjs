import prisma from "@/lib/prisma"

const clients = new Set()

export function addClient(client) {
  clients.add(client)
}

export function removeClient(client) {
  clients.delete(client)
}

export async function emitEvent(event) {
  const data = `data: ${JSON.stringify(event)}\n\n`
  clients.forEach(client => {
    client.write(data)
  })
} 