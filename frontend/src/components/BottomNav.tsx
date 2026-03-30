import React from 'react'
import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <div className="bottomNav">
      <div className="navPill" role="navigation" aria-label="Navigation">
        <NavLink to="/swipe" className={({ isActive }) => (isActive ? 'navItem navItemActive' : 'navItem')}>
          Свайп
        </NavLink>
        <NavLink to="/matches" className={({ isActive }) => (isActive ? 'navItem navItemActive' : 'navItem')}>
          Матчи
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'navItem navItemActive' : 'navItem')}>
          Профиль
        </NavLink>
      </div>
    </div>
  )
}

