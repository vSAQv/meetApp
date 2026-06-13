import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { useTheme } from '../state/ThemeContext';
import { useLocale } from '../i18n';

export default function TopBar({ backUrl, title }: { backUrl?: string; title?: React.ReactNode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang, t } = useLocale()

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="topbar">
      {backUrl ? (
        <button className="topbar-back" onClick={() => navigate(backUrl)}>
          ←
        </button>
      ) : (
        <div className="brand" role="banner">
          meet
        </div>
      )}

      {title && (
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontWeight: 600,
          fontSize: 16,
          whiteSpace: 'nowrap',
          pointerEvents: 'none' // Чтобы клики проходили сквозь текст, если он длинный
        }}>
          {title}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignItems: 'center' }}>
        <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} className="btn" style={{ padding: '6px 10px', fontSize: 13, background: 'transparent' }}>
          {lang.toUpperCase()}
        </button>
        <button onClick={toggleTheme} className="btn" style={{ padding: '6px 10px', fontSize: 16, background: 'transparent' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="btn" onClick={onLogout} style={{ padding: '6px 12px', fontSize: '13px' }}>
          {t('logout')}
        </button>
      </div>
    </div>
  )
}