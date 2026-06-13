/**
 * i18n.ts — Internationalisation module (RU / EN)
 *
 * Works without any external state-management library.
 * Language preference is persisted in localStorage under the key "app_lang".
 *
 * Usage inside a component:
 *   import { useLocale } from '../i18n'
 *   const { lang, setLang, t } = useLocale()
 */

import { useState, useEffect } from 'react'

export type Language = 'ru' | 'en'

/** Full translation dictionary */
const translations = {
  ru: {
    logout: 'Выйти',
    swipe: 'Свайп',
    matches: 'Матчи',
    profile: 'Профиль',
    myMatches: 'Мои Матчи',
    noMatches: 'У вас пока нет взаимных симпатий. Продолжайте свайпать!',
    openChatHint: 'Нажмите, чтобы открыть чат',
    loading: 'Загрузка...',
    errorLoadingMatches: 'Ошибка загрузки матчей',
    errorLoadingProfile: 'Ошибка загрузки профиля',
    errorSavingProfile: 'Ошибка сохранения профиля',
    errorLoadingCandidates: 'Ошибка загрузки кандидатов',
    noCandidates: 'Нет кандидатов. Попробуй позже.',
    swipeHint: 'Свайпни вправо / влево',
    photo: 'Фотография',
    displayName: 'Имя / Никнейм',
    city: 'Город',
    bio: 'О себе',
    saveInfo: 'Сохранить',
    saving: 'Сохранение...',
    saved: 'Сохранено',
    chatWith: 'Чат',
    noMessages: 'Напишите первое сообщение!',
    messagePlaceholder: 'Сообщение...',
    sendError: 'Ошибка отправки',
  },
  en: {
    logout: 'Logout',
    swipe: 'Swipe',
    matches: 'Matches',
    profile: 'Profile',
    myMatches: 'My Matches',
    noMatches: 'No mutual matches yet. Keep swiping!',
    openChatHint: 'Tap to open chat',
    loading: 'Loading...',
    errorLoadingMatches: 'Failed to load matches',
    errorLoadingProfile: 'Failed to load profile',
    errorSavingProfile: 'Failed to save profile',
    errorLoadingCandidates: 'Failed to load candidates',
    noCandidates: 'No candidates. Try again later.',
    swipeHint: 'Swipe right / left',
    photo: 'Photo',
    displayName: 'Display Name',
    city: 'City',
    bio: 'About me',
    saveInfo: 'Save',
    saving: 'Saving...',
    saved: 'Saved',
    chatWith: 'Chat',
    noMessages: 'Send the first message!',
    messagePlaceholder: 'Type a message...',
    sendError: 'Send error',
  },
}

export type TranslationKey = keyof typeof translations.ru

// ---------------------------------------------------------------------------
// Module-level singleton — avoids any external library
// ---------------------------------------------------------------------------

/** Read language from localStorage, fall back to 'ru' */
const readLang = (): Language => {
  const v = localStorage.getItem('app_lang')
  return v === 'en' ? 'en' : 'ru'
}

/** Current language stored at module level so all hook instances share it */
let _lang: Language = readLang()

/** Registered re-render callbacks from each hook instance */
const _listeners = new Set<() => void>()

/** Notify every mounted component that is using useLocale() */
const _notify = () => _listeners.forEach((fn) => fn())

/** Change language, persist to localStorage, and re-render all consumers */
const _setLang = (lang: Language) => {
  _lang = lang
  localStorage.setItem('app_lang', lang)
  _notify()
}

/** Translate a key using the current language */
const _t = (key: TranslationKey): string => translations[_lang][key]

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

/**
 * useLocale
 * Returns the current language code, a setter, and a translation function.
 *
 * Example:
 *   const { lang, setLang, t } = useLocale()
 *   <button onClick={() => setLang('en')}>{t('logout')}</button>
 */
export const useLocale = () => {
  const [, forceRender] = useState(0)

  useEffect(() => {
    // Register this component as a listener so it re-renders on language change
    const cb = () => forceRender((n) => n + 1)
    _listeners.add(cb)
    return () => { _listeners.delete(cb) }
  }, [])

  return {
    lang: _lang,
    setLang: _setLang,
    t: _t,
  }
}
