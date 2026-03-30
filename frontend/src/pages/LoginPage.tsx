import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../state/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setToken } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await login({ username, password })
      setToken(res.accessToken)
      if (res.emailVerified) navigate('/swipe')
      else navigate('/verify')
    } catch (err: any) {
      setError(err?.message || 'Ошибка входа')
    }
  }

  return (
    <div className="app">
      <div className="container">
        <div className="card" style={{ marginTop: 26 }}>
          <div className="brand" style={{ fontSize: 20, marginBottom: 12 }}>
            Вход
          </div>
          <form className="form" onSubmit={onSubmit}>
            <div className="field">
              <label>Логин</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error ? <div className="error">{error}</div> : null}

            <div className="actions">
              <button className="btn btnPrimary" type="submit">
                Войти
              </button>
            </div>
          </form>

          <div className="hint" style={{ marginTop: 12 }}>
            Нет аккаунта? <Link to="/register" style={{ color: 'var(--text)' }}>Регистрация</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

