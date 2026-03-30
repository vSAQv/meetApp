import React from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav'
import { useAuth } from '../state/AuthContext'

export default function TopBar({ showNav }: { showNav?: boolean }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand" role="banner">
          meet
        </div>
        <button className="btn" onClick={onLogout}>
          Выйти
        </button>
      </div>
      {showNav ? <BottomNav /> : null}
    </div>
  )
}

