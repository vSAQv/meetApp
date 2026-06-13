import { requestJson } from './http'

export type SendMessageRequest = {
  matchId: number
  content: string
}

export type MessageResponse = {
  id: number
  matchId: number
  senderId: number
  content: string
  createdAt: string
  readAt: string | null
}

export async function sendMessage(token: string, req: SendMessageRequest): Promise<MessageResponse> {
  return requestJson('/api/messages', { method: 'POST', token, body: JSON.stringify(req) })
}

export async function getMessages(token: string, matchId: number): Promise<MessageResponse[]> {
  return requestJson(`/api/messages/${matchId}`, { method: 'GET', token })
}

