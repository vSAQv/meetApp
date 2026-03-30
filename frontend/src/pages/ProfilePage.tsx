import React, { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { getMyProfiles, ProfileResponse, updateProfile } from '../api/profile'
import TopBar from '../components/TopBar'

export default function ProfilePage() {
  const { token } = useAuth()
  const [profiles, setProfiles] = useState<ProfileResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)

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
        }
      })
      .catch((e: any) => setError(e?.message || 'Ошибка загрузки профиля'))
      .finally(() => setLoading(false))
  }, [token])

  const current = profiles[0]

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !current) return
    setSaving(true)
    setError(null)
    try {
      const res = await updateProfile(token, current.id, {
        displayName,
        bio: bio || null,
        city: city || null
      })
      setProfiles([res])
    } catch (err: any) {
      setError(err?.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app">
      <TopBar showNav />
      <div className="container">
        <div className="card" style={{ marginTop: 18 }}>
          <div className="brand" style={{ fontSize: 18, marginBottom: 8 }}>
            Мой профиль
          </div>
          {loading ? <div className="hint">Загрузка...</div> : null}
          {error ? <div className="error">{error}</div> : null}
          {current ? (
            <form className="form" onSubmit={onSave}>
              <div className="field">
                <label>Имя</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="field">
                <label>О себе</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="field">
                <label>Город</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="actions">
                <button className="btn btnPrimary" type="submit" disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          ) : (
            <div className="hint">Профиль не найден.</div>
          )}
        </div>
      </div>
    </div>
  )
}

