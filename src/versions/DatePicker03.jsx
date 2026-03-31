import { useState, useRef, useEffect } from 'react'

const MIN_YEAR = 1920
const MAX_YEAR = 2026

function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}
function daysInYear(y) {
  return isLeap(y) ? 366 : 365
}

// normalized (0–1, 0–1) → date object
function normToDate(nx, ny) {
  const year = Math.round(MIN_YEAR + ny * (MAX_YEAR - MIN_YEAR))
  const maxD = daysInYear(year)
  const doy  = Math.round(1 + nx * (maxD - 1))
  const d    = new Date(year, 0, doy)
  return { month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() }
}

// date → normalized position
function dateToNorm(month, day, year) {
  const doy  = Math.floor((new Date(year, month - 1, day) - new Date(year, 0, 0)) / 86400000)
  const maxD = daysInYear(year)
  return {
    x: Math.max(0, Math.min(1, (doy - 1) / (maxD - 1))),
    y: Math.max(0, Math.min(1, (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR))),
  }
}

const today    = new Date()
const initPos  = dateToNorm(today.getMonth() + 1, today.getDate(), today.getFullYear())

const PAD_W = 480
const PAD_H = 400

export default function DatePicker03() {
  const [pos, setPos]       = useState(initPos)
  const [active, setActive] = useState(false)
  const padRef              = useRef(null)

  function posFromEvent(e) {
    const rect = padRef.current.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left)  / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top)   / rect.height)),
    }
  }

  function handleMouseDown(e) {
    e.preventDefault()
    setActive(true)
    setPos(posFromEvent(e))
  }

  useEffect(() => {
    if (!active) return
    function onMove(e) { setPos(posFromEvent(e)) }
    function onUp()    { setActive(false) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [active])

  const date   = normToDate(pos.x, pos.y)
  const p      = n => String(n).padStart(2, '0')
  const output = `${p(date.month)}/${p(date.day)}/${date.year}`

  const cornerLabel = {
    position: 'absolute',
    fontSize: 10,
    color: '#c0c0c0',
    fontFamily: 'Helvetica, Arial, sans-serif',
    letterSpacing: '0.06em',
    pointerEvents: 'none',
    lineHeight: 1,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44 }}>

      {/* Pad */}
      <div
        ref={padRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          width: PAD_W,
          height: PAD_H,
          background: '#ededed',
          borderRadius: 20,
          cursor: 'crosshair',
          userSelect: 'none',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Crosshair — horizontal */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          top: `${pos.y * 100}%`,
          height: 1,
          background: '#d8d8d8',
          pointerEvents: 'none',
        }} />

        {/* Crosshair — vertical */}
        <div style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: `${pos.x * 100}%`,
          width: 1,
          background: '#d8d8d8',
          pointerEvents: 'none',
        }} />

        {/* Corner labels */}
        <span style={{ ...cornerLabel, top: 12, left: 14 }}>1/1/{MIN_YEAR}</span>
        <span style={{ ...cornerLabel, top: 12, right: 14, textAlign: 'right' }}>12/31/{MIN_YEAR}</span>
        <span style={{ ...cornerLabel, bottom: 12, left: 14 }}>1/1/{MAX_YEAR}</span>
        <span style={{ ...cornerLabel, bottom: 12, right: 14, textAlign: 'right' }}>12/31/{MAX_YEAR}</span>

        {/* Dot */}
        <div style={{
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: active ? '#777' : '#aaa',
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          transition: active ? 'none' : 'background 0.2s',
        }} />
      </div>

      {/* Date output */}
      <div style={{
        fontSize: 96,
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 300,
        color: '#999',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {output}
      </div>

    </div>
  )
}
