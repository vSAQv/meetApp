import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../api/http'
import { useAuth } from '../state/AuthContext'
import { CandidateProfileResponse, getRecommendations } from '../api/profile'
import { swipe } from '../api/swipes'
import SwipeCard from '../components/SwipeCard'
import BottomNav from '../components/BottomNav'
import TopBar from '../components/TopBar'
import { useLocale } from '../i18n'

export default function SwipePage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { t } = useLocale()

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
      // Фильтруем по userId, так как свайпаем мы именно юзеров
      const filtered = list.filter((p) => !swipedIds.current.has(p.userId))
      setStack((prev) => {
        const merged = [...prev, ...filtered]
        const seen = new Set<number>()
        return merged.filter((p) => {
          if (seen.has(p.userId)) return false
          seen.add(p.userId)
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

    // Используем правильный ID аккаунта
    const targetId = top.userId
    swipedIds.current.add(targetId)

    try {
      const match = await swipe(token, { targetUserId: targetId, like: direction })
      setStack((prev) => prev.slice(1))

      if (match) {
        navigate(`/chat/${match.id}`)
      }
    } catch (e: any) {
      setError(e?.message || 'Ошибка свайпа')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <TopBar />
      <div className="container" style={{ paddingBottom: 100 }}>
        <div className="swipeArea">
          {loading ? <div className="hint">Загрузка...</div> : null}
          {error ? <div className="error" style={{ width: 'min(420px, 92vw)' }}>{error}</div> : null}
          {!loading && !top ? <div className="hint">Нет кандидатов. Попробуй позже.</div> : null}

          {top ? (
            <SwipeCard
              key={top.id} // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: заставляет React перерисовать карточку по центру
              photoUrl={top.photoUrl ? `${apiBase}${top.photoUrl}` : null}
              displayName={top.displayName}
              bio={top.bio}
              city={top.city}
              onLike={() => doSwipe(true)}
              onDislike={() => doSwipe(false)}
            />
          ) : null}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}