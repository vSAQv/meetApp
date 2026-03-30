import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { getMyMatches, MatchResponse } from '../api/swipes'
import TopBar from '../components/TopBar'

export default function MatchesPage() {
  const { token } = useAuth()
  const [matches, setMatches] = useState<MatchResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setError(null)
    getMyMatches(token)
      .then((list) => setMatches(list))
      .catch((e: any) => setError(e?.message || 'Ошибка загрузки матчей'))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="app">
      <TopBar showNav />
      <div className="container">
        <div className="card" style={{ marginTop: 18 }}>
          <div className="brand" style={{ fontSize: 18, marginBottom: 8 }}>
            Матчи
          </div>

          {loading ? <div className="hint">Загрузка...</div> : null}
          {error ? <div className="error">{error}</div> : null}

          {!loading && matches.length === 0 ? <div className="hint">Пока нет матчей.</div> : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {matches.map((m) => (
              <Link
                key={m.id}
                to={`/chat/${m.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: 12,
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 4 }}>Матч #{m.id}</div>
                <div className="hint" style={{ marginTop: 0 }}>
                  Пользователи: {m.user1Id} и {m.user2Id}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

