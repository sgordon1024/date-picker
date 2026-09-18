import { useState, useRef, useEffect } from 'react'

// 09 · SLING — pull away from today, let go: further is farther

const today = new Date()
const MS_DAY = 86400000

function offsetToDays(dx) {
  // quadratic-ish scale: gentle nearby, huge at full pull
  const days = Math.pow(Math.abs(dx) / 14, 1.9)
  return Math.round(days) * Math.sign(dx)
}

export default function DatePicker09() {
  const [pull, setPull] = useState(0)        // px displacement while dragging
  const [committed, setCommitted] = useState(0) // days offset committed
  const [dragging, setDragging] = useState(false)
  const [springing, setSpringing] = useState(false)
  const anchorRef = useRef(null)

  function dxFromEvent(e) {
    const rect = anchorRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    return Math.max(-320, Math.min(320, e.clientX - cx))
  }

  function onMouseDown(e) {
    e.preventDefault()
    setDragging(true)
    setSpringing(false)
    setPull(dxFromEvent(e))
  }

  useEffect(() => {
    if (!dragging) return
    function onMove(e) { setPull(dxFromEvent(e)) }
    function onUp() {
      setDragging(false)
      setCommitted(c => c + offsetToDays(pull))
      setSpringing(true)
      setPull(0)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, pull])

  const previewDays = committed + (dragging ? offsetToDays(pull) : 0)
  const date = new Date(today.getTime() + previewDays * MS_DAY)
  const p = n => String(n).padStart(2, '0')
  const output = `${p(date.getMonth() + 1)}/${p(date.getDate())}/${date.getFullYear()}`

  const deltaLabel = previewDays === 0 ? 'today'
    : previewDays > 0 ? `+${previewDays} day${previewDays === 1 ? '' : 's'}`
    : `${previewDays} day${previewDays === -1 ? '' : 's'}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48, fontFamily: 'Helvetica, Arial, sans-serif' }}>

      {/* sling area */}
      <div style={{ position: 'relative', width: 680, height: 140, userSelect: 'none' }}>
        {/* center line */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: '#eee' }} />
        {/* past / future labels */}
        <span style={{ position: 'absolute', left: 0, top: 12, fontSize: 10, letterSpacing: '0.12em', color: '#d0d0d0' }}>← PAST</span>
        <span style={{ position: 'absolute', right: 0, top: 12, fontSize: 10, letterSpacing: '0.12em', color: '#d0d0d0' }}>FUTURE →</span>

        {/* band */}
        <svg width="680" height="140" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <line
            x1={340} y1={70}
            x2={340 + pull} y2={70}
            stroke="#c8c8c8" strokeWidth={2}
            strokeDasharray={dragging ? 'none' : '2 4'}
          />
        </svg>

        {/* anchor (today) */}
        <div
          ref={anchorRef}
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 14, height: 14, borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1.5px solid #ccc', background: '#fff',
          }}
        />

        {/* handle */}
        <div
          onMouseDown={onMouseDown}
          onDoubleClick={() => { setCommitted(0); setSpringing(true) }}
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 34, height: 34, borderRadius: '50%',
            transform: `translate(calc(-50% + ${pull}px), -50%)`,
            border: '6px solid transparent',
            backgroundClip: 'padding-box',
            background: dragging ? '#777' : '#a8a8a8',
            cursor: dragging ? 'grabbing' : 'grab',
            transition: springing && !dragging ? 'transform 0.45s cubic-bezier(0.2, 1.6, 0.4, 1)' : 'none',
            boxShadow: dragging ? '0 2px 10px rgba(0,0,0,0.12)' : 'none',
            zIndex: 2,
          }}
        />

        {/* delta label */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          textAlign: 'center', fontSize: 11, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#c0c0c0',
        }}>
          {deltaLabel}{committed !== 0 && !dragging ? ' · double-click the dot to reset' : ''}
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
