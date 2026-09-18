import { useState, useRef } from 'react'

// 08 · GRID — the whole year as a dot matrix: 12 columns × 31 rows

const MONTH_ABBR = ['J','F','M','A','M','J','J','A','S','O','N','D']
const MIN_YEAR = 1920
const MAX_YEAR = 2030
const today = new Date()

function daysInMonth(m, y) { return new Date(y, m, 0).getDate() }

export default function DatePicker08() {
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [day, setDay] = useState(today.getDate())
  const [year, setYear] = useState(today.getFullYear())
  const [hover, setHover] = useState(null) // {m, d} | null
  const railRef = useRef(null)
  const [railDrag, setRailDrag] = useState(false)

  function railYear(e) {
    const rect = railRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    setYear(Math.round(MIN_YEAR + (x / rect.width) * (MAX_YEAR - MIN_YEAR)))
  }

  // clamp day if year change made Feb 29 invalid
  const maxDay = daysInMonth(month, year)
  const shownDay = Math.min(day, maxDay)

  const p = n => String(n).padStart(2, '0')
  const output = `${p(month)}/${p(shownDay)}/${year}`

  const CELLW = 26, CELLH = 11, GAP = 3

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, fontFamily: 'Helvetica, Arial, sans-serif' }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, userSelect: 'none' }}>
        {/* month letters */}
        <div style={{ display: 'flex', gap: GAP, marginLeft: 0 }}>
          {MONTH_ABBR.map((l, i) => (
            <div key={i} style={{
              width: CELLW, textAlign: 'center', fontSize: 9, letterSpacing: '0.08em',
              color: i + 1 === (hover ? hover.m : month) ? '#999' : '#d8d8d8',
            }}>{l}</div>
          ))}
        </div>

        {/* 31 rows × 12 columns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
          {Array.from({ length: 31 }, (_, r) => r + 1).map(d => (
            <div key={d} style={{ display: 'flex', gap: GAP }}>
              {Array.from({ length: 12 }, (_, c) => c + 1).map(m => {
                const valid = d <= daysInMonth(m, year)
                const isSel = valid && m === month && d === shownDay
                const isHover = valid && hover && hover.m === m && hover.d === d
                return (
                  <div
                    key={m}
                    onMouseEnter={valid ? () => setHover({ m, d }) : undefined}
                    onMouseLeave={valid ? () => setHover(null) : undefined}
                    onClick={valid ? () => { setMonth(m); setDay(d) } : undefined}
                    style={{
                      width: CELLW, height: CELLH,
                      borderRadius: 3,
                      background: !valid ? 'transparent'
                        : isSel ? '#8a8a8a'
                        : isHover ? '#cfcfcf'
                        : '#efefef',
                      cursor: valid ? 'pointer' : 'default',
                      transition: 'background 0.08s',
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* year rail */}
        <div
          ref={railRef}
          onMouseDown={e => { setRailDrag(true); railYear(e) }}
          onMouseMove={e => railDrag && railYear(e)}
          onMouseUp={() => setRailDrag(false)}
          onMouseLeave={() => setRailDrag(false)}
          style={{
            marginTop: 10,
            height: 22,
            borderRadius: 6,
            background: '#f3f3f3',
            position: 'relative',
            cursor: 'ew-resize',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, bottom: 0, width: 2, background: '#8a8a8a',
            left: `${((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%`,
          }} />
          <span style={{ position: 'absolute', left: 8, top: 5, fontSize: 9, color: '#c8c8c8' }}>{MIN_YEAR}</span>
          <span style={{ position: 'absolute', right: 8, top: 5, fontSize: 9, color: '#c8c8c8' }}>{MAX_YEAR}</span>
        </div>
      </div>

      <div style={{
        fontSize: 96, fontWeight: 300, color: '#999',
        letterSpacing: '-0.02em', lineHeight: 1, userSelect: 'none',
      }}>
        {output}
      </div>
    </div>
  )
}
