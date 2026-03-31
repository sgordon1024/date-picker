import { useState, useEffect, useRef } from 'react'

// ─── parser ───────────────────────────────────────────────────────────────────

const MONTHS = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
}

function yr(y) {
  if (y < 100) return y > 30 ? 1900 + y : 2000 + y
  return y
}

function make(month, day, year) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  if (year < 1 || year > 9999) return null
  const d = new Date(year, month - 1, day)
  if (d.getMonth() + 1 !== month || d.getDate() !== day) return null
  return { month, day, year: d.getFullYear() }
}

function parseDate(raw) {
  const s = raw.trim().toLowerCase()
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(\d+)(st|nd|rd|th)/g, '$1')  // strip ordinals
    .replace(/^the\s+/, '')                 // strip leading "the"
    .trim()

  if (!s) return null

  let m

  // ISO: YYYY-MM-DD
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return make(+m[2], +m[3], +m[1])

  // MM/DD/YYYY or MM-DD-YYYY or MM.DD.YYYY
  m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/)
  if (m) return make(+m[1], +m[2], yr(+m[3]))

  // MM/YYYY
  m = s.match(/^(\d{1,2})[\/\-\.](\d{4})$/)
  if (m) return make(+m[1], 1, +m[2])

  // Month DD YYYY  /  Month 'YY
  m = s.match(/^([a-z]+)\s+(\d{1,2})\s+['\u2019]?(\d{2,4})$/)
  if (m && MONTHS[m[1]]) return make(MONTHS[m[1]], +m[2], yr(+m[3]))

  // DD Month YYYY
  m = s.match(/^(\d{1,2})\s+([a-z]+)\s+['\u2019]?(\d{2,4})$/)
  if (m && MONTHS[m[2]]) return make(MONTHS[m[2]], +m[1], yr(+m[3]))

  // DD of Month YYYY
  m = s.match(/^(\d{1,2})\s+of\s+([a-z]+)\s+['\u2019]?(\d{2,4})$/)
  if (m && MONTHS[m[2]]) return make(MONTHS[m[2]], +m[1], yr(+m[3]))

  // Month YYYY  (day defaults to 1)
  m = s.match(/^([a-z]+)\s+(\d{4})$/)
  if (m && MONTHS[m[1]]) return make(MONTHS[m[1]], 1, +m[2])

  return null
}

// ─── cycling placeholder ──────────────────────────────────────────────────────

const EXAMPLES = [
  'march 15 1994',
  '3/15/94',
  '15 march 1994',
  '1994-03-15',
  'the 4th of july 1976',
  'sep 1 2001',
  'dec 31 1999',
  'jan 1 1920',
]

// ─── animated digit ───────────────────────────────────────────────────────────

function AnimDigit({ value, active }) {
  const [slot, setSlot] = useState({ k: 0 })
  const prev = useRef(value)
  useEffect(() => {
    if (value !== prev.current) {
      setSlot(s => ({ k: s.k + 1 }))
      prev.current = value
    }
  }, [value])
  return (
    <span style={{ display: 'inline-block', perspective: '400px' }}>
      <span
        key={slot.k}
        style={{
          display: 'inline-block',
          animation: slot.k > 0 ? 'v05-settle 220ms cubic-bezier(0.22,1,0.36,1) both' : 'none',
          color: active ? '#888' : '#ccc',
          transition: 'color 0.3s',
        }}
      >
        {value}
      </span>
    </span>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

const today  = new Date()
const INIT   = { month: today.getMonth() + 1, day: today.getDate(), year: today.getFullYear() }

export default function DatePicker05() {
  const [input,       setInput]       = useState('')
  const [parsed,      setParsed]      = useState(null)
  const [phaseIdx,    setPhaseIdx]    = useState(0)
  const [phaseVisible, setPhaseVisible] = useState(true)
  const inputRef = useRef(null)

  // Cycle placeholder examples
  useEffect(() => {
    const fade = setInterval(() => {
      setPhaseVisible(false)
      setTimeout(() => {
        setPhaseIdx(i => (i + 1) % EXAMPLES.length)
        setPhaseVisible(true)
      }, 400)
    }, 2800)
    return () => clearInterval(fade)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setInput(val)
    setParsed(val.trim() ? parseDate(val) : null)
  }

  const hasInput    = input.trim().length > 0
  const displayDate = parsed || (!hasInput ? INIT : null)
  const p           = n => String(n).padStart(2, '0')

  const mo  = displayDate ? p(displayDate.month) : '--'
  const dy  = displayDate ? p(displayDate.day)   : '--'
  const yr  = displayDate ? String(displayDate.year) : '----'
  const sep = '/'

  const outputActive = !!displayDate

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 52 }}
      onClick={() => inputRef.current?.focus()}
    >
      <style>{`
        @keyframes v05-settle {
          0%   { transform: translateY(-18%) rotateX(30deg); opacity: 0; }
          100% { transform: translateY(0)    rotateX(0deg);  opacity: 1; }
        }
      `}</style>

      {/* Input area */}
      <div style={{ width: 440, position: 'relative' }}>

        {/* Placeholder (cycling examples) */}
        {!hasInput && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0,
            fontSize: 28,
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 300,
            color: '#ddd',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
            lineHeight: '1',
            padding: '0 0 12px',
            opacity: phaseVisible ? 1 : 0,
            transition: 'opacity 0.35s',
          }}>
            {EXAMPLES[phaseIdx]}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 28,
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 300,
            color: '#777',
            width: '100%',
            letterSpacing: '0.01em',
            padding: '0 0 12px',
            caretColor: '#bbb',
            display: 'block',
          }}
        />

        {/* Underline */}
        <div style={{
          height: 1,
          background: hasInput && !parsed ? '#f0f0f0'
            : parsed               ? '#d4d4d4'
            : '#ebebeb',
          transition: 'background 0.3s',
        }} />

        {/* Status dot */}
        {hasInput && (
          <div style={{
            position: 'absolute',
            right: 0,
            bottom: 18,
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: parsed ? '#bbb' : '#e8e8e8',
            transition: 'background 0.3s',
          }} />
        )}
      </div>

      {/* Date output */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
        fontSize: 96,
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 300,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        <AnimDigit value={mo} active={outputActive} />
        <span style={{ color: '#e0e0e0' }}>{sep}</span>
        <AnimDigit value={dy} active={outputActive} />
        <span style={{ color: '#e0e0e0' }}>{sep}</span>
        <AnimDigit value={yr} active={outputActive} />
      </div>

    </div>
  )
}
