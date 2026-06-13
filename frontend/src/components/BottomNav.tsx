import React from 'react'
import { NavLink } from 'react-router-dom'
import { useLocale } from '../i18n'

export default function BottomNav() {
  const { t } = useLocale()

  return (
    <div className="bottomNav">
      <div className="navPill" role="navigation" aria-label="Navigation">
        <NavLink to="/swipe" className={({ isActive }) => (isActive ? 'navItem navItemActive' : 'navItem')}>
          {t('swipe')}
        </NavLink>
        <NavLink to="/matches" className={({ isActive }) => (isActive ? 'navItem navItemActive' : 'navItem')}>
          {t('matches')}
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'navItem navItemActive' : 'navItem')}>
          {t('profile')}
        </NavLink>
      </div>
    </div>
  )
}