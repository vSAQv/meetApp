import React, { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { getMyProfiles, ProfileResponse, updateProfile, createProfile } from '../api/profile'
import { uploadPhoto } from '../api/photos'
import { getApiBaseUrl } from '../api/http'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { useLocale } from '../i18n'

export default function ProfilePage() {
  const { token } = useAuth()
  const { t } = useLocale()
  const [profiles, setProfiles] = useState<ProfileResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null)

  const apiBase = getApiBaseUrl()

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    getMyProfiles(token)
      .then((list) => {
        setProfiles(list)
        const p = list[0]
        if (p) {
          setDisplayName(p.displayName)
          setBio(p.bio || '')
          setCity(p.city || '')
          if (p.photoUrl) setUploadedPhotoUrl(`${apiBase}${p.photoUrl}`)
        }
      })
      .catch((e: any) => setError(e?.message || t('errorLoadingProfile')))
      .finally(() => setLoading(false))
  }, [token, t, apiBase])

  const current = profiles[0]

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      let res: ProfileResponse;
      if (current) {
        res = await updateProfile(token, current.id, {
          displayName,
          bio: bio || undefined,
          city: city || undefined
        })
      } else {
        res = await createProfile(token, {
          displayName,
          bio: bio || undefined,
          city: city || undefined
        })
      }
      setProfiles([res])
    } catch (err: any) {
      setError(err?.message || t('errorSavingProfile'))
    } finally {
      setSaving(false)
    }
  }

  const onUploadPhoto = async () => {
    if (!token || !current || !photoFile) return
    setUploading(true)
    setError(null)
    try {
      const photo = await uploadPhoto(token, current.id, photoFile)
      setUploadedPhotoUrl(`${apiBase}${photo.url}`)
      setPhotoFile(null)
    } catch (err: any) {
      setError(err?.message || 'Ошибка загрузки фото')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="app">
      <TopBar />
      <div className="container">
        <div className="card" style={{ marginTop: 18 }}>
          <div className="brand" style={{ fontSize: 18, marginBottom: 8 }}>
            {t('profile')}
          </div>
          {loading ? <div className="hint">{t('loading')}</div> : null}
          {error ? <div className="error">{error}</div> : null}

          {!loading && (
            <form className="form" onSubmit={onSave}>
              <div className="field">
                <label>{t('displayName')}</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              </div>
              <div className="field">
                <label>{t('bio')}</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="field">
                <label>{t('city')}</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="actions">
                <button className="btn btnPrimary" type="submit" disabled={saving}>
                  {saving ? t('saving') : t('saveInfo')}
                </button>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="brand" style={{ fontSize: 16, marginBottom: 8 }}>{t('photo')}</div>

                {!current ? (
                  <div className="hint">Сначала сохраните профиль, чтобы загрузить фото.</div>
                ) : (
                  <>
                    {uploadedPhotoUrl && (
                      <div style={{ marginBottom: 12 }}>
                        <img src={uploadedPhotoUrl} alt="My Avatar" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
                      </div>
                    )}
                    <div className="field">
                      <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                    </div>
                    {photoFile && (
                      <div className="actions">
                        <button className="btn btnPrimary" type="button" onClick={onUploadPhoto} disabled={uploading}>
                          {uploading ? t('loading') : 'Загрузить фото'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}