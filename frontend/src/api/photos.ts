import { getApiBaseUrl } from './http'

export type ProfilePhotoResponse = {
  id: number
  url: string
  mainPhoto: boolean
}

export async function uploadPhoto(token: string, profileId: number, file: File): Promise<ProfilePhotoResponse> {
  const url = `${getApiBaseUrl()}/api/photos/${profileId}`
  const formData = new FormData()
  formData.append('file', file)

  const headers = new Headers()
  headers.set('Authorization', `Bearer ${token}`)
  // При отправке FormData браузер сам установит Content-Type: multipart/form-data с правильным boundary

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!res.ok) {
    let details: any = null
    try {
      details = await res.json()
    } catch {
      // ignore
    }
    const msg = details?.message || details?.error || `${res.status} ${res.statusText}`
    throw new Error(msg)
  }

  return await res.json()
}
