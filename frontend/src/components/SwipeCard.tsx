import React, { useMemo, useRef, useState } from 'react'

export default function SwipeCard({
  photoUrl,
  displayName,
  bio,
  city,
  onLike,
  onDislike,
}: {
  photoUrl: string | null
  displayName: string
  bio: string | null
  city: string | null
  onLike: () => void
  onDislike: () => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [swiped, setSwiped] = useState(false)
  const pointerStartX = useRef(0)

  const threshold = 120

  const likeOpacity = useMemo(() => Math.min(1, Math.max(0, (dragX - 20) / threshold)), [dragX])
  const dislikeOpacity = useMemo(
    () => Math.min(1, Math.max(0, (-dragX - 20) / threshold)),
    [dragX],
  )

  const reset = () => {
    setDragging(false)
    setDragX(0)
    if (ref.current) ref.current.style.transition = 'transform 180ms ease'
  }

  const triggerLike = () => {
    setSwiped(true)
    setDragging(false)
    setDragX(window.innerWidth + 200)
    if (ref.current) ref.current.style.transition = 'transform 300ms ease'
    setTimeout(() => onLike(), 250)
  }

  const triggerDislike = () => {
    setSwiped(true)
    setDragging(false)
    setDragX(-(window.innerWidth + 200))
    if (ref.current) ref.current.style.transition = 'transform 300ms ease'
    setTimeout(() => onDislike(), 250)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (swiped || !ref.current) return
    ref.current.style.transition = 'none'
    pointerStartX.current = e.clientX
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - pointerStartX.current
    setDragX(dx)
  }

  const onPointerUp = () => {
    if (!dragging) return
    if (dragX >= threshold) triggerLike()
    else if (dragX <= -threshold) triggerDislike()
    else reset()
  }

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean)
    const a = parts[0]?.[0] || ''
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
    return (a + b).toUpperCase()
  }, [displayName])

  const transform = `translateX(${dragX}px) rotate(${dragX / 20}deg)`

  return (
    <div
      className="swipeCardWrap"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="application"
      aria-label="Swipe card"
    >
      <div ref={ref} className="swipeCard" style={{ transform }}>
        {photoUrl ? (
          <img className="swipeImg" src={photoUrl} alt={displayName} draggable={false} />
        ) : (
          <div className="swipeAvatar">{initials}</div>
        )}

        <div className="swipeOverlayLeft" style={{ opacity: dislikeOpacity }}>
          ✕
        </div>
        <div className="swipeOverlayRight" style={{ opacity: likeOpacity }}>
          ♥
        </div>

        <div className="swipeFooter">
          <div className="swipeName">{displayName}</div>
          {city ? <div className="swipeCity">{city}</div> : null}
          {bio ? <div className="swipeBio">{bio}</div> : null}
        </div>
      </div>
    </div>
  )
}

