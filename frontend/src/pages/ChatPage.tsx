import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { getMessages, sendMessage, MessageResponse } from '../api/messages'
import TopBar from '../components/TopBar'

export default function ChatPage() {
  const { token } = useAuth()
  const { matchId } = useParams()
  const matchIdNum = Number(matchId)

  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const listRef = useRef<HTMLDivElement | null>(null)

  const refresh = async () => {
    if (!token || !Number.isFinite(matchIdNum)) return
    setError(null)
    const list = await getMessages(token, matchIdNum)
    setMessages(list)
    // прокрутка вниз после обновления
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  useEffect(() => {
    if (!token) return
    setLoading(true)
    refresh()
      .catch((e: any) => setError(e?.message || 'Ошибка загрузки сообщений'))
      .finally(() => setLoading(false))
    const t = window.setInterval(() => {
      refresh().catch(() => {
        // игнорируем периодические ошибки
      })
    }, 3000)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, matchId])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (!content.trim()) return
    setSending(true)
    setError(null)
    try {
      await sendMessage(token, { matchId: matchIdNum, content })
      setContent('')
      await refresh()
    } catch (err: any) {
      setError(err?.message || 'Ошибка отправки')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="app">
      <TopBar showNav={false} />
      <div className="container">
        <div className="card" style={{ marginTop: 18, padding: 0 }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontWeight: 900, marginBottom: 4 }}>Чат · Матч #{matchIdNum}</div>
            <div className="hint">Отправляй сообщения — обновление каждые 3 секунды</div>
          </div>

          <div
            ref={listRef}
            style={{
              height: 520,
              overflow: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            {loading ? <div className="hint">Загрузка...</div> : null}
            {error ? <div className="error">{error}</div> : null}
            {!loading && messages.length === 0 ? <div className="hint">Сообщений пока нет.</div> : null}

            {messages.map((m) => {
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: 'flex-start',
                    maxWidth: '86%',
                    padding: '10px 12px',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ fontSize: 14, lineHeight: 1.35, wordBreak: 'break-word' }}>{m.content}</div>
                  <div className="hint" style={{ marginTop: 6 }}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>

          <form onSubmit={onSubmit} style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Сообщение</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Напиши что-нибудь..."
                style={{ minHeight: 64 }}
              />
            </div>
            <div className="actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btnPrimary" type="submit" disabled={sending}>
                {sending ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

