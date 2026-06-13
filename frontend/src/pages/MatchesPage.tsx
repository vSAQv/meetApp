import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { getApiBaseUrl } from '../api/http'
import { getMyMatches, MatchResponse } from '../api/swipes'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { useLocale } from '../i18n'

export default function MatchesPage() {
  const { token } = useAuth()
  const { t } = useLocale()
  const [matches, setMatches] = useState<MatchResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiBase = getApiBaseUrl()

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    getMyMatches(token)
      .then((list) => setMatches(list))
      .catch((e: any) => setError(e?.message || t('errorLoadingMatches')))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="app">
      <TopBar />
      <div className="container">
        <div className="card">
          <div className="brand" style={{ fontSize: 20, marginBottom: 16 }}>
            {t('myMatches')}
          </div>

          {loading ? <div className="hint">{t('loading')}</div> : null}
          {error ? <div className="error">{error}</div> : null}

          {!loading && matches.length === 0 ? <div className="hint">{t('noMatches')}</div> : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {matches.map((m) => (
              <Link
                key={m.id}
                to={`/chat/${m.id}`}
                className="matchItem"
              >
                {m.partnerPhotoUrl ? (
                  <img src={`${apiBase}${m.partnerPhotoUrl}`} className="matchAvatar" alt="Avatar" />
                ) : (
                  <div className="matchAvatar">{m.partnerName.charAt(0).toUpperCase()}</div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>{m.partnerName}</div>
                  <div className="hint" style={{ marginTop: 0 }}>{t('openChatHint')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
