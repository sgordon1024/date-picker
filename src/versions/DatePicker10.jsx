import { useState, useRef, useEffect } from 'react'

// 10 · AGO — relative time, logarithmic: drag up for the past, down for the future

const today = new Date()
const MS_DAY = 86400000
const H = 360
const PX_PER_DECADE = 62   // pixels per 10x of days

function dyToDays(dy) {
  // logarithmic: every PX_PER_DECADE px = 10× more days
  const mag = Math.pow(10, Math.abs(dy) / PX_PER_DECADE) - 1
  return Math.round(mag) * (dy > 0 ? 1 : -1)   // drag down = negative dy? handled by caller
}

function daysToDy(days) {
  if (days === 0) return 0
  return Math.log10(Math.abs(days) + 1) * PX_PER_DECADE * Math.sign(days)
}

function relLabel(days) {
  if (days === 0) return 'today'
  const abs = Math.abs(days)
  const dir = days < 0 ? 'ago' : 'ahead'
  const fmt = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'} ${dir}`
  if (abs < 14) return fmt(abs, 'day')
  if (abs < 60) return fmt(Math.round(abs / 7), 'week')
  if (abs < 700) return fmt(Math.round(abs / 30.44), 'month')
  return fmt(Math.round(abs / 365.25 * 10) / 10, 'year')
}

const TICKS = [1, 7, 30, 365, 3650, 36500] // day, week, month, year, decade, century

export default function DatePicker10() {
  const [days, setDays] = useState(0)
  const dragRef = useRef(null) // { startY, startDays }

  function onMouseDown(e) {
    e.preventDefault()
    dragRef.current = { startY: e.clientY, startDy: daysToDy(days) }
  }

  useEffect(() => {
    function onMove(e) {
      const d = dragRef.current
      if (!d) return
      // drag up = past (negative), drag down = future (positive)? Steve reads time top=past
      const dy = d.startDy + (d.startY - e.clientY) * -1
      const clamped = Math.max(-PX_PER_DECADE * 4.8, Math.min(PX_PER_DECADE * 4.8, dy))
      const mag = Math.pow(10, Math.abs(clamped) / PX_PER_DECADE) - 1
      setDays(Math.round(mag) * Math.sign(clamped))
    }
    function onUp() { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const date = new Date(today.getTime() + days * MS_DAY)
  const p = n => String(n).padStart(2, '0')
  const output = `${p(date.getMonth() + 1)}/${p(date.getDate())}/${date.getFullYear()}`
  const needleY = H / 2 + daysToDy(days) * 0.72

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 72, fontFamily: 'Helvetica, Arial, sans-serif' }}>

      {/* scale */}
      <div
        onMouseDown={onMouseDown}
        style={{
          position: 'relative', width: 150, height: H,
          cursor: 'ns-resize', userSelect: 'none', flexShrink: 0,
        }}
      >
        {/* spine */}
        <div style={{ position: 'absolute', left: 74, top: 0, bottom: 0, width: 1, background: '#e8e8e8' }} />

        {/* ticks mirrored: past above, future below */}
        {TICKS.map(t => {
          const off = daysToDy(t) * 0.72
          return ['past', 'future'].map(dir => {
            const y = H / 2 + (dir === 'past' ? -off : off)
            if (y < 0 || y > H) return null
            return (
              <div key={dir + t} style={{ position: 'absolute', top: y, left: 60, right: 60 }}>
                <div style={{ height: 1, background: '#ddd' }} />
                <span style={{
                  position: 'absolute', left: dir === 'past' ? -52 : undefined, right: dir === 'future' ? -58 : undefined,
                  top: -5, fontSize: 9, letterSpacing: '0.08em', color: '#ccc', whiteSpace: 'nowrap',
                }}>
                  {t === 1 ? 'DAY' : t === 7 ? 'WEEK' : t === 30 ? 'MONTH' : t === 365 ? 'YEAR' : t === 3650 ? 'DECADE' : 'CENTURY'}
                </span>
              </div>
            )
          })
        })}

        {/* center = today */}
        <div style={{ position: 'absolute', top: H / 2, left: 50, right: 50 }}>
          <div style={{ height: 1.5, background: '#aaa' }} />
        </div>
        <span style={{ position: 'absolute', top: H / 2 - 4, left: 150, fontSize: 9, letterSpacing: '0.12em', color: '#b5b5b5' }}>TODAY</span>

        {/* needle */}
        <div style={{
          position: 'absolute', top: needleY, left: 66, width: 17, height: 17,
          borderRadius: '50%', background: dragRef.current ? '#777' : '#999',
          transform: 'translateY(-50%)', transition: 'background 0.15s',
        }} />

        <span style={{ position: 'absolute', top: -18, left: 0, right: 0, textAlign: 'center', fontSize: 9, letterSpacing: '0.14em', color: '#d5d5d5' }}>PAST ↑</span>
        <span style={{ position: 'absolute', bottom: -18, left: 0, right: 0, textAlign: 'center', fontSize: 9, letterSpacing: '0.14em', color: '#d5d5d5' }}>↓ FUTURE</span>
      </div>

      {/* readout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, userSelect: 'none' }}>
        <div style={{ fontSize: 30, fontWeight: 300, color: '#b0b0b0', letterSpacing: '-0.01em' }}>
          {relLabel(days)}
        </div>
        <div style={{ fontSize: 96, fontWeight: 300, color: '#999', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {output}
        </div>
      </div>
    </div>
  )
}
