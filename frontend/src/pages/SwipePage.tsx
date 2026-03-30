import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../api/http'
import { useAuth } from '../state/AuthContext'
import { CandidateProfileResponse, getRecommendations } from '../api/profile'
import { swipe } from '../api/swipes'
import SwipeCard from '../components/SwipeCard'

export default function SwipePage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [stack, setStack] = useState<CandidateProfileResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const swipedIds = useRef<Set<number>>(new Set())
  const loadingMoreRef = useRef(false)

  const apiBase = useMemo(() => getApiBaseUrl(), [])

  async function loadMore() {
    if (!token) return
    if (loadingMoreRef.current) return
    loadingMoreRef.current = true
    setError(null)
    try {
      const list = await getRecommendations(token, 20)
      const filtered = list.filter((p) => !swipedIds.current.has(p.id))
      setStack((prev) => {
        const merged = [...prev, ...filtered]
        // защита от дублей на клиенте
        const seen = new Set<number>()
        return merged.filter((p) => {
          if (seen.has(p.id)) return false
          seen.add(p.id)
          return true
        })
      })
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки кандидатов')
    } finally {
      loadingMoreRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    setLoading(true)
    setStack([])
    swipedIds.current = new Set()
    loadMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (!token) return
    if (!loading && stack.length < 3) {
      loadMore()
    }
  }, [loading, stack.length, token])

  const top = stack[0]

  const doSwipe = async (direction: boolean) => {
    if (!token || !top) return
    if (busy) return
    setBusy(true)

    const targetId = top.id
    swipedIds.current.add(targetId)

    try {
      const match = await swipe(token, { targetUserId: targetId, like: direction })
      setStack((prev) => prev.slice(1))

      if (match) {
        // При матче сразу открываем чат.
        navigate(`/chat/${match.id}`)
      }
    } catch (e: any) {
      setError(e?.message || 'Ошибка свайпа')
      // если ошибка — откатим удаление
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      {/* TopBar сверху, чтобы не плодить элементы */}
      <div className="container" style={{ flex: 1 }}>
        <div className="topbar">
          <div className="brand">meet</div>
          <div className="hint">Свайпни вправо/влево</div>
        </div>

        <div className="swipeArea">
          {loading ? <div className="hint">Загрузка...</div> : null}
          {error ? <div className="error" style={{ width: 'min(420px, 92vw)' }}>{error}</div> : null}
          {!loading && !top ? <div className="hint">Нет кандидатов. Попробуй позже.</div> : null}
          {top ? (
            <SwipeCard
              photoUrl={top.photoUrl ? `${apiBase}${top.photoUrl}` : null}
              displayName={top.displayName}
              bio={top.bio}
              city={top.city}
              onLike={() => doSwipe(true)}
              onDislike={() => doSwipe(false)}
            />
          ) : null}
        </div>

        {/* Bottom nav */}
        <div style={{ marginTop: 'auto' }}>
          <div className="bottomNav">
            <div className="navPill" role="navigation" aria-label="Navigation">
              <a className="navItem navItemActive" href="/swipe">
                Свайп
              </a>
              <a className="navItem" href="/matches">
                Матчи
              </a>
              <a className="navItem" href="/profile">
                Профиль
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

