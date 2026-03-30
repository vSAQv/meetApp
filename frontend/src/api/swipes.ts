import { requestJson } from './http'

export type SwipeRequest = {
  targetUserId: number
  like: boolean
}

export type MatchResponse = {
  id: number
  user1Id: number
  user2Id: number
}

export async function swipe(token: string, req: SwipeRequest): Promise<MatchResponse | null> {
  return requestJson('/api/swipes', { method: 'POST', token, body: JSON.stringify(req) })
}

export async function getMyMatches(token: string): Promise<MatchResponse[]> {
  return requestJson('/api/swipes/matches', { method: 'GET', token })
}

