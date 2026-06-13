import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../state/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setToken } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('MALE')
  const [lookingForGender, setLookingForGender] = useState('FEMALE')

  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await register({
        username,
        email,
        password,
        dateOfBirth,
        gender,
        lookingForGender
      })
      setToken(res.accessToken)
      navigate('/verify', { state: { token: res.emailVerificationToken } })
    } catch (err: any) {
      setError(err?.message || 'Ошибка регистрации')
    }
  }

  return (
    <div className="app">
      <div className="container">
        <div className="card" style={{ marginTop: 26 }}>
          <div className="brand" style={{ fontSize: 20, marginBottom: 12 }}>
            Регистрация
          </div>
          <form className="form" onSubmit={onSubmit}>
            <div className="field">
              <label>Логин</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="field">
              <label>Дата рождения</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
            <div className="row">
              <div className="field">
                <label>Пол</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} aria-label="Пол">
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div className="field">
                <label>Ищу</label>
                <select
                  value={lookingForGender}
                  onChange={(e) => setLookingForGender(e.target.value)}
                  aria-label="Ищу"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            {error ? <div className="error">{error}</div> : null}
            <div className="actions">
              <button className="btn btnPrimary" type="submit">
                Зарегистрироваться
              </button>
            </div>
          </form>

          <div className="hint" style={{ marginTop: 12 }}>
            Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--text)' }}>Вход</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

