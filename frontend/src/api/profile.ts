import { requestJson } from './http'

export type CreateOrUpdateProfileRequest = {
  displayName: string
  bio?: string
  city?: string
}

export type ProfileResponse = {
  id: number
  displayName: string
  bio: string | null
  city: string | null
  active: boolean
}

export type CandidateProfileResponse = {
  id: number
  displayName: string
  bio: string | null
  city: string | null
  photoUrl: string | null
}

export async function getMyProfiles(token: string): Promise<ProfileResponse[]> {
  return requestJson('/api/profiles/me', { method: 'GET', token })
}

export async function getRecommendations(token: string, limit = 20): Promise<CandidateProfileResponse[]> {
  return requestJson(`/api/profiles/recommendations`, { method: 'GET', token })
}

export async function updateProfile(token: string, id: number, req: CreateOrUpdateProfileRequest): Promise<ProfileResponse> {
  return requestJson(`/api/profiles/${id}`, { method: 'PUT', token, body: JSON.stringify(req) })
}

