import { useState, useRef, useEffect, useCallback } from 'react'
import './DatePicker02.css'

const today = new Date()
const CURRENT_MONTH = today.getMonth() + 1
const CURRENT_DAY   = today.getDate()
const CURRENT_YEAR  = today.getFullYear()

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate()
}

function wrap(val, min, max) {
  if (val > max) return min
  if (val < min) return max
  return val
}

// Inner span gets remounted each time animKey changes, replaying the CSS animation
function RollingSlot({ value, dir, pad }) {
  const [slot, setSlot] = useState({ k: 0, dir: 'up' })
  const prevRef = useRef(value)

  useEffect(() => {
    if (value !== prevRef.current) {
      setSlot(s => ({ k: s.k + 1, dir }))
      prevRef.current = value
    }
  }, [value, dir])

  const display = pad ? String(value).padStart(2, '0') : String(value)

  return (
    <span style={{ display: 'inline-block', perspective: '500px', perspectiveOrigin: '50% 50%' }}>
      <span key={slot.k} className={`roll-${slot.dir}`} style={{ display: 'inline-block' }}>
        {display}
      </span>
    </span>
  )
}

export default function DatePicker02() {
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [day,   setDay]   = useState(CURRENT_DAY)
  const [year,  setYear]  = useState(CURRENT_YEAR)
  const [monthDir, setMonthDir] = useState('up')
  const [dayDir,   setDayDir]   = useState('up')
  const [yearDir,  setYearDir]  = useState('up')

  // Refs for RAF closure — always current
  const monthRef = useRef(CURRENT_MONTH)
  const dayRef   = useRef(CURRENT_DAY)
  const yearRef  = useRef(CURRENT_YEAR)

  const activeFieldRef = useRef(null) // 'month' | 'day' | 'year' | null
  const speedRef       = useRef(0)    // values per second
  const dirRef         = useRef('up')
  const accumRef       = useRef(0)
  const lastTimeRef    = useRef(null)
  const rafRef         = useRef(null)

  function syncMonth(val) { monthRef.current = val; setMonth(val) }
  function syncDay(val)   { dayRef.current = val;   setDay(val)   }
  function syncYear(val)  { yearRef.current = val;  setYear(val)  }

  // Wrapped in a ref so the RAF closure always calls the latest version
  const stepRef = useRef(null)
  stepRef.current = function step(field, direction) {
    if (field === 'month') {
      const next = direction === 'up'
        ? wrap(monthRef.current + 1, 1, 12)
        : wrap(monthRef.current - 1, 1, 12)
      setMonthDir(direction)
      syncMonth(next)
      const maxDay = daysInMonth(next, yearRef.current)
      if (dayRef.current > maxDay) syncDay(maxDay)
    } else if (field === 'day') {
      const maxDay = daysInMonth(monthRef.current, yearRef.current)
      const next = direction === 'up'
        ? wrap(dayRef.current + 1, 1, maxDay)
        : wrap(dayRef.current - 1, 1, maxDay)
      setDayDir(direction)
      syncDay(next)
    } else if (field === 'year') {
      const next = direction === 'up' ? yearRef.current + 1 : yearRef.current - 1
      setYearDir(direction)
      syncYear(next)
    }
  }

  const rafLoop = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp
    const dt = Math.min(timestamp - lastTimeRef.current, 100)
    lastTimeRef.current = timestamp

    accumRef.current += (dt / 1000) * speedRef.current

    while (accumRef.current >= 1) {
      accumRef.current -= 1
      if (activeFieldRef.current) {
        stepRef.current(activeFieldRef.current, dirRef.current)
      }
    }

    rafRef.current = requestAnimationFrame(rafLoop)
  }, [])

  function startRaf() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    lastTimeRef.current = null
    accumRef.current = 0
    rafRef.current = requestAnimationFrame(rafLoop)
  }

  function stopRaf() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  useEffect(() => () => stopRaf(), [])

  function handleMouseEnter(field) {
    activeFieldRef.current = field
    startRaf()
  }

  function handleMouseLeave(field) {
    if (activeFieldRef.current === field) {
      activeFieldRef.current = null
      stopRaf()
    }
  }

  function handleMouseMove(e, field) {
    if (activeFieldRef.current !== field) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relY = (e.clientY - rect.top) / rect.height   // 0 = top, 1 = bottom
    const distFromCenter = Math.abs(relY - 0.5) * 2     // 0 = center, 1 = edge

    const DEAD_ZONE = 0.12
    if (distFromCenter < DEAD_ZONE) {
      speedRef.current = 0
      return
    }

    dirRef.current = relY < 0.5 ? 'up' : 'down'

    // Quadratic easing: slow near center, fast at edge — max ~18 changes/sec
    const normalized = (distFromCenter - DEAD_ZONE) / (1 - DEAD_ZONE)
    speedRef.current = Math.pow(normalized, 1.8) * 18
  }

  const pad = n => String(n).padStart(2, '0')
  const output = `${pad(month)}/${pad(day)}/${year}`

  const slotWrap = {
    cursor: 'ns-resize',
    userSelect: 'none',
    display: 'inline-block',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>

      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        fontSize: 96,
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 300,
        color: '#999',
        letterSpacing: '-0.02em',
      }}>
        <span
          style={slotWrap}
          onMouseEnter={() => handleMouseEnter('month')}
          onMouseLeave={() => handleMouseLeave('month')}
          onMouseMove={e => handleMouseMove(e, 'month')}
        >
          <RollingSlot value={month} dir={monthDir} pad />
        </span>

        <span style={{ color: '#d0d0d0', lineHeight: 1 }}>/</span>

        <span
          style={slotWrap}
          onMouseEnter={() => handleMouseEnter('day')}
          onMouseLeave={() => handleMouseLeave('day')}
          onMouseMove={e => handleMouseMove(e, 'day')}
        >
          <RollingSlot value={day} dir={dayDir} pad />
        </span>

        <span style={{ color: '#d0d0d0', lineHeight: 1 }}>/</span>

        <span
          style={slotWrap}
          onMouseEnter={() => handleMouseEnter('year')}
          onMouseLeave={() => handleMouseLeave('year')}
          onMouseMove={e => handleMouseMove(e, 'year')}
        >
          <RollingSlot value={year} dir={yearDir} pad={false} />
        </span>
      </div>

      <div style={{
        fontSize: 12,
        letterSpacing: '0.12em',
        color: '#ccc',
        fontFamily: 'Helvetica, Arial, sans-serif',
        textTransform: 'uppercase',
      }}>
        {output}
      </div>

    </div>
  )
}
