import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { verifyEmail } from '../api/auth'
import { useAuth } from '../state/AuthContext'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setToken } = useAuth()

  const [token, setTokenValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const state: any = location.state
    if (state?.token) setTokenValue(state.token)
  }, [location.state])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const res = await verifyEmail('', { token })
      setToken(res.accessToken)
      setSuccess('Email подтвержден')
      navigate('/swipe')
    } catch (err: any) {
      setError(err?.message || 'Ошибка верификации')
    }
  }

  return (
    <div className="app">
      <div className="container">
        <div className="card" style={{ marginTop: 26 }}>
          <div className="brand" style={{ fontSize: 20, marginBottom: 12 }}>
            Подтверждение email
          </div>
          <form className="form" onSubmit={onSubmit}>
            <div className="field">
              <label>Токен из письма</label>
              <input value={token} onChange={(e) => setTokenValue(e.target.value)} />
            </div>
            {error ? <div className="error">{error}</div> : null}
            {success ? <div className="success">{success}</div> : null}
            <div className="actions">
              <button className="btn btnPrimary" type="submit">
                Подтвердить
              </button>
            </div>
          </form>

          <div className="hint" style={{ marginTop: 12 }}>
            <Link to="/login" style={{ color: 'var(--text)' }}>
              Вернуться ко входу
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

