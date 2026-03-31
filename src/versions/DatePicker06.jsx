import { useState, useRef } from 'react'

// ─── helpers ──────────────────────────────────────────────────────────────────

const MIN_YEAR  = 1920
const MAX_YEAR  = 2026
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const BAND_W    = 480

function daysInMonth(m, y) { return new Date(y, m, 0).getDate() }
const today = new Date()

// ─── segmented band (month + day) ────────────────────────────────────────────

function SegBand({ values, selected, onHover, renderLabel, radius = 6, height = 60 }) {
  const n = values.length
  return (
    <div style={{ display: 'flex', gap: 2, width: BAND_W, height, flexShrink: 0 }}>
      {values.map(v => {
        const isSelected = v === selected
        return (
          <div
            key={v}
            onMouseEnter={() => onHover(v)}
            style={{
              flex: 1,
              background: isSelected ? '#e2e2e2' : '#f3f3f3',
              borderRadius: radius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'crosshair',
              userSelect: 'none',
              transition: 'background 0.06s',
            }}
          >
            <span style={{
              fontSize: n <= 12 ? 10 : 8,
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: isSelected ? '#888' : '#ccc',
              letterSpacing: '0.04em',
              transition: 'color 0.06s',
              pointerEvents: 'none',
            }}>
              {renderLabel(v)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── continuous band (year) ───────────────────────────────────────────────────

const DECADES = Array.from(
  { length: Math.floor((MAX_YEAR - MIN_YEAR) / 10) + 1 },
  (_, i) => MIN_YEAR + i * 10
).filter(y => y <= MAX_YEAR)

function YearBand({ selected, onHover }) {
  const ref    = useRef(null)
  const [hoverX, setHoverX] = useState(null)
  const range  = MAX_YEAR - MIN_YEAR
  const slotW  = BAND_W / (range + 1)
  const selX   = ((selected - MIN_YEAR) / range) * BAND_W

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect()
    const x    = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    setHoverX(x)
    onHover(Math.max(MIN_YEAR, Math.min(MAX_YEAR, Math.round(MIN_YEAR + (x / rect.width) * range))))
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverX(null)}
      style={{
        position: 'relative',
        width: BAND_W,
        height: 56,
        background: '#f3f3f3',
        borderRadius: 10,
        cursor: 'crosshair',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Selected slot */}
      <div style={{
        position: 'absolute',
        left: selX,
        top: 0, bottom: 0,
        width: Math.max(3, slotW),
        background: '#e2e2e2',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />

      {/* Decade ticks + labels */}
      {DECADES.map(yr => {
        const x    = ((yr - MIN_YEAR) / range) * 100
        const isSel = yr === selected
        return (
          <div key={yr} style={{ position: 'absolute', left: `${x}%`, top: 0, bottom: 0, pointerEvents: 'none' }}>
            <div style={{ width: 1, background: '#ddd', position: 'absolute', top: '30%', bottom: '30%' }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 4,
              transform: 'translateY(-50%)',
              fontSize: 8,
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: isSel ? '#999' : '#ccc',
              letterSpacing: '0.03em',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}>
              {yr}
            </div>
          </div>
        )
      })}

      {/* Hover needle */}
      {hoverX !== null && (
        <div style={{
          position: 'absolute',
          left: hoverX,
          top: 0, bottom: 0,
          width: 1,
          background: '#aaa',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Edge fades */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, background: 'linear-gradient(to right, #f3f3f3, transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 36, background: 'linear-gradient(to left, #f3f3f3, transparent)', pointerEvents: 'none' }} />
    </div>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

export default function DatePicker06() {
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [day,   setDay]   = useState(today.getDate())
  const [year,  setYear]  = useState(today.getFullYear())

  const maxDay     = daysInMonth(month, year)
  const displayDay = Math.min(day, maxDay)
  const days       = Array.from({ length: maxDay }, (_, i) => i + 1)
  const months     = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  function handleMonthHover(m) {
    setMonth(m)
    const max = daysInMonth(m, year)
    if (day > max) setDay(max)
  }

  function handleYearHover(y) {
    setYear(y)
    const max = daysInMonth(month, y)
    if (day > max) setDay(max)
  }

  const p      = n => String(n).padStart(2, '0')
  const output = `${p(month)}/${p(displayDay)}/${year}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

      <SegBand
        values={months}
        selected={month}
        onHover={handleMonthHover}
        renderLabel={v => MONTH_ABBR[v - 1]}
        radius={8}
        height={64}
      />

      <SegBand
        values={days}
        selected={displayDay}
        onHover={setDay}
        renderLabel={v => (v === 1 || v % 5 === 0) ? String(v) : ''}
        radius={4}
        height={52}
      />

      <YearBand
        selected={year}
        onHover={handleYearHover}
      />

      <div style={{
        marginTop: 36,
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
