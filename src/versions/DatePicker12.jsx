import { useState, useRef, useEffect } from 'react'

// 12 · FATE — lock what you like, roll the rest

const today = new Date()
const MIN_YEAR = 1920
const MAX_YEAR = 2030

function daysInMonth(m, y) { return new Date(y, m, 0).getDate() }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

export default function DatePicker12() {
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [day, setDay] = useState(today.getDate())
  const [year, setYear] = useState(today.getFullYear())
  const [locks, setLocks] = useState({ month: false, day: false, year: false })
  const [rolling, setRolling] = useState(false)
  const timerRef = useRef(null)

  function rollOnce(final) {
    setYear(y => {
      const ny = locks.year ? y : rand(MIN_YEAR, MAX_YEAR)
      setMonth(m => {
        const nm = locks.month ? m : rand(1, 12)
        setDay(d => {
          const maxD = daysInMonth(nm, ny)
          return locks.day ? Math.min(d, maxD) : rand(1, maxD)
        })
        return nm
      })
      return ny
    })
  }

  function roll() {
    if (rolling) return
    if (locks.month && locks.day && locks.year) return
    setRolling(true)
    let n = 0
    let delay = 42
    function spin() {
      rollOnce(false)
      n++
      if (n < 16) {
        delay *= 1.16   // decelerate
        timerRef.current = setTimeout(spin, delay)
      } else {
        setRolling(false)
      }
    }
    spin()
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const p = n => String(n).padStart(2, '0')
  const segs = [
    { key: 'month', text: p(month) },
    { key: 'day', text: p(day) },
    { key: 'year', text: String(year) },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 52, fontFamily: 'Helvetica, Arial, sans-serif' }}>

      {/* the date, each segment lockable */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        {segs.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              <span
                onClick={() => setLocks(l => ({ ...l, [s.key]: !l[s.key] }))}
                style={{
                  fontSize: 96, fontWeight: 300, lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: locks[s.key] ? '#666' : '#b5b5b5',
                  cursor: 'pointer', userSelect: 'none',
                  transition: 'color 0.15s',
                }}
                title={locks[s.key] ? 'click to unlock' : 'click to lock'}
              >
                {s.text}
              </span>
              <span style={{
                fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: locks[s.key] ? '#888' : '#d8d8d8', userSelect: 'none', cursor: 'pointer',
              }}
                onClick={() => setLocks(l => ({ ...l, [s.key]: !l[s.key] }))}
              >
                {locks[s.key] ? '● locked' : '○ loose'}
              </span>
            </div>
            {i < 2 && <span style={{ fontSize: 96, fontWeight: 300, color: '#e0e0e0', lineHeight: 1 }}>/</span>}
          </div>
        ))}
      </div>

      {/* roll */}
      <div
        onClick={roll}
        style={{
          padding: '14px 44px',
          borderRadius: 999,
          border: '1.5px solid ' + (rolling ? '#bbb' : '#ddd'),
          color: rolling ? '#999' : '#aaa',
          fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase',
          cursor: rolling ? 'default' : 'pointer', userSelect: 'none',
          transition: 'border-color 0.15s, color 0.15s',
        }}
      >
        {rolling ? 'rolling…' : 'roll the dice'}
      </div>
    </div>
  )
}
