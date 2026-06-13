import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { getMessages, sendMessage, MessageResponse } from '../api/messages'
import { getMatch, MatchResponse } from '../api/swipes'
import { getApiBaseUrl } from '../api/http'
import TopBar from '../components/TopBar'
import { Client } from '@stomp/stompjs'
import { useLocale } from '../i18n'

export default function ChatPage() {
  const { token } = useAuth()
  const { matchId } = useParams()
  const matchIdNum = Number(matchId)
  const { t } = useLocale()

  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [matchInfo, setMatchInfo] = useState<MatchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const listRef = useRef<HTMLDivElement | null>(null)
  const apiBase = getApiBaseUrl()

  const refreshMessages = async () => {
    if (!token || !Number.isFinite(matchIdNum)) return
    const list = await getMessages(token, matchIdNum)
    setMessages(list)
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  const loadData = async () => {
    if (!token || !Number.isFinite(matchIdNum)) return
    setLoading(true)
    setError(null)
    try {
      const match = await getMatch(token, matchIdNum)
      setMatchInfo(match)
      await refreshMessages()
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки чата')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    if (!token) return

    const wsUrl = window.location.protocol === 'https:' ? `wss://${window.location.host}/ws` : `ws://${window.location.host}/ws`
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        client.subscribe(`/topic/chat.${matchIdNum}`, (message) => {
          if (message.body) {
            const newMsg: MessageResponse = JSON.parse(message.body)
            setMessages((prev) => {
              if (prev.find((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
            requestAnimationFrame(() => {
              listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
            })
          }
        })
      }
    })

    client.activate()
    return () => { client.deactivate() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, matchIdNum])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !content.trim()) return
    setSending(true)
    setError(null)
    try {
      await sendMessage(token, { matchId: matchIdNum, content })
      setContent('')
    } catch (err: any) {
      setError(err?.message || 'Ошибка отправки')
    } finally {
      setSending(false)
    }
  }

  const TitleComponent = matchInfo ? (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      {matchInfo.partnerPhotoUrl ? (
        <img
          src={`${apiBase}${matchInfo.partnerPhotoUrl}`}
          alt="Avatar"
          style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', fontSize: 12 }}>
          {matchInfo.partnerName.charAt(0).toUpperCase()}
        </div>
      )}
      <span>{matchInfo.partnerName}</span>
    </div>
  ) : 'Чат'

  return (
    <div className="app" style={{ height: '100vh', overflow: 'hidden' }}>
      <TopBar backUrl="/matches" title={TitleComponent} />
      <div className="container" style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)' }}>
        <div className="card" style={{ marginTop: 0, padding: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            {loading ? <div className="hint">Загрузка...</div> : null}
            {error ? <div className="error">{error}</div> : null}
            {!loading && messages.length === 0 ? <div className="hint" style={{ textAlign: 'center', marginTop: 40 }}>Напишите первое сообщение!</div> : null}

            {messages.map((m) => {
              // В реальном приложении мы бы сверяли m.senderId === myProfileId.
              // Но для простоты: если senderId === partnerId, значит чужое
              const isOwn = matchInfo && m.senderId !== matchInfo.partnerId

              return (
                <div key={m.id} className={`chatMessage ${isOwn ? 'own' : ''}`}>
                  <div>{m.content}</div>
                  <div className="chatTime">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>

          <form onSubmit={onSubmit} style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10 }}>
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('messagePlaceholder')}
              style={{ flex: 1, margin: 0, borderRadius: 20 }}
            />
            <button className="btn btnPrimary" type="submit" disabled={sending} style={{ borderRadius: 20 }}>
              {sending ? '...' : '➤'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
