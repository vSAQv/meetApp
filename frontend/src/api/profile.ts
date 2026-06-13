import { requestJson, getApiBaseUrl } from './http'

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
  photoUrl: string | null
}

export type CandidateProfileResponse = {
  id: number
  userId: number // ДОБАВЛЕНО
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

export async function createProfile(token: string, req: CreateOrUpdateProfileRequest): Promise<ProfileResponse> {
  return requestJson(`/api/profiles`, { method: 'POST', token, body: JSON.stringify(req) })
}

export async function updateProfile(token: string, id: number, req: CreateOrUpdateProfileRequest): Promise<ProfileResponse> {
  return requestJson(`/api/profiles/${id}`, { method: 'PUT', token, body: JSON.stringify(req) })
}

export async function uploadPhoto(token: string, id: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${getApiBaseUrl()}/profiles/${id}/photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // СТРОГО ЗАПРЕЩЕНО писать 'Content-Type': 'multipart/form-data'
    },
    body: formData
  })
  if (!res.ok) throw new Error('Ошибка загрузки файла')
  return res.json()
}