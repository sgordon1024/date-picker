import { useState, useRef, useEffect } from 'react'

// ─── constants ────────────────────────────────────────────────────────────────

const MIN_YEAR = 1920
const MAX_YEAR = 2026
const CX = 250, CY = 250
const INNER_R  = 88
const OUTER_R  = 222
const LABEL_R  = OUTER_R + 22
const SVG_SIZE = 500

// ─── date math ────────────────────────────────────────────────────────────────

function isLeap(y)     { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 }
function daysInYear(y) { return isLeap(y) ? 366 : 365 }

function dayOfYear(month, day, year) {
  return Math.floor((new Date(year, month - 1, day) - new Date(year, 0, 0)) / 86400000)
}

// angle (0 = Jan 1, clockwise radians), radius (0–1) → date
function polarToDate(angle, radius) {
  const year = Math.round(MIN_YEAR + Math.max(0, Math.min(1, radius)) * (MAX_YEAR - MIN_YEAR))
  const maxD = daysInYear(year)
  let a = angle % (2 * Math.PI)
  if (a < 0) a += 2 * Math.PI
  const doy = Math.max(1, Math.min(maxD, Math.round(1 + (a / (2 * Math.PI)) * maxD)))
  const d   = new Date(year, 0, doy)
  return { month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() }
}

// date → polar
function dateToPolar(month, day, year) {
  const doy    = dayOfYear(month, day, year)
  const maxD   = daysInYear(year)
  return {
    angle:  ((doy - 1) / maxD) * 2 * Math.PI,
    radius: (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR),
  }
}

// polar + dims → SVG x/y coords
function polarToXY(angle, radius) {
  const r        = INNER_R + Math.max(0, Math.min(1, radius)) * (OUTER_R - INNER_R)
  const svgAngle = angle - Math.PI / 2   // 0 = top
  return { x: CX + r * Math.cos(svgAngle), y: CY + r * Math.sin(svgAngle), r }
}

// ─── precomputed geometry ─────────────────────────────────────────────────────

const MONTH_ABBR      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_START_DOY = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]

// Spoke at start of each month, label at mid-month
const MONTH_GEOMETRY = MONTH_ABBR.map((name, i) => {
  const spokeAngle = ((MONTH_START_DOY[i] - 1) / 365) * 2 * Math.PI - Math.PI / 2
  const midDoy     = MONTH_START_DOY[i] + 14
  const labelAngle = ((midDoy - 1) / 365) * 2 * Math.PI - Math.PI / 2
  return {
    name,
    spoke: {
      x1: CX + INNER_R * Math.cos(spokeAngle),
      y1: CY + INNER_R * Math.sin(spokeAngle),
      x2: CX + OUTER_R * Math.cos(spokeAngle),
      y2: CY + OUTER_R * Math.sin(spokeAngle),
      // small tick outside ring
      tx1: CX + OUTER_R * Math.cos(spokeAngle),
      ty1: CY + OUTER_R * Math.sin(spokeAngle),
      tx2: CX + (OUTER_R + 7) * Math.cos(spokeAngle),
      ty2: CY + (OUTER_R + 7) * Math.sin(spokeAngle),
    },
    label: {
      x: CX + LABEL_R * Math.cos(labelAngle),
      y: CY + LABEL_R * Math.sin(labelAngle),
    },
  }
})

// Decade rings
const DECADE_RINGS = []
for (let y = MIN_YEAR; y <= MAX_YEAR; y += 10) {
  DECADE_RINGS.push({
    year: y,
    r: INNER_R + ((y - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (OUTER_R - INNER_R),
  })
}

// ─── component ────────────────────────────────────────────────────────────────

const today    = new Date()
const initPolar = dateToPolar(today.getMonth() + 1, today.getDate(), today.getFullYear())

export default function DatePicker04() {
  const [polar, setPolar]   = useState(initPolar)
  const [active, setActive] = useState(false)
  const svgRef = useRef(null)

  function eventToPolar(e) {
    const rect  = svgRef.current.getBoundingClientRect()
    const scale = SVG_SIZE / rect.width
    const dx    = (e.clientX - rect.left)  * scale - CX
    const dy    = (e.clientY - rect.top)   * scale - CY
    const dist  = Math.sqrt(dx * dx + dy * dy)
    let angle   = Math.atan2(dy, dx) + Math.PI / 2
    if (angle < 0)              angle += 2 * Math.PI
    if (angle >= 2 * Math.PI)   angle -= 2 * Math.PI
    return {
      angle,
      radius: Math.max(0, Math.min(1, (dist - INNER_R) / (OUTER_R - INNER_R))),
    }
  }

  function handleMouseDown(e) {
    e.preventDefault()
    setActive(true)
    setPolar(eventToPolar(e))
  }

  useEffect(() => {
    if (!active) return
    function onMove(e) { setPolar(eventToPolar(e)) }
    function onUp()    { setActive(false) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [active])

  const date   = polarToDate(polar.angle, polar.radius)
  const dot    = polarToXY(polar.angle, polar.radius)
  const p      = n => String(n).padStart(2, '0')
  const output = `${p(date.month)}/${p(date.day)}/${date.year}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        onMouseDown={handleMouseDown}
        style={{
          width: 400,
          height: 400,
          cursor: 'crosshair',
          userSelect: 'none',
          display: 'block',
        }}
      >
        <defs>
          <radialGradient id="donut-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ffffff" />
            <stop offset="42%"  stopColor="#f7f7f7" />
            <stop offset="100%" stopColor="#f0f0f0" />
          </radialGradient>
          {/* Mask to cut out inner circle */}
          <mask id="donut-mask">
            <circle cx={CX} cy={CY} r={OUTER_R} fill="white" />
            <circle cx={CX} cy={CY} r={INNER_R} fill="black" />
          </mask>
        </defs>

        {/* Donut background */}
        <circle cx={CX} cy={CY} r={OUTER_R} fill="url(#donut-bg)" />
        <circle cx={CX} cy={CY} r={INNER_R} fill="white" />

        {/* Decade rings */}
        {DECADE_RINGS.map(({ year, r }) => (
          <circle key={year} cx={CX} cy={CY} r={r}
            fill="none" stroke="#e6e6e6" strokeWidth={0.5} />
        ))}

        {/* Month spokes + ticks */}
        {MONTH_GEOMETRY.map(({ name, spoke }) => (
          <g key={name}>
            <line x1={spoke.x1} y1={spoke.y1} x2={spoke.x2} y2={spoke.y2}
              stroke="#ebebeb" strokeWidth={0.5} />
            <line x1={spoke.tx1} y1={spoke.ty1} x2={spoke.tx2} y2={spoke.ty2}
              stroke="#d8d8d8" strokeWidth={1} />
          </g>
        ))}

        {/* Month labels */}
        {MONTH_GEOMETRY.map(({ name, label }) => (
          <text key={name} x={label.x} y={label.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fill="#c8c8c8"
            fontFamily="Helvetica, Arial, sans-serif"
            letterSpacing="0.04em">
            {name}
          </text>
        ))}

        {/* Ring border */}
        <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke="#dedede" strokeWidth={1} />
        <circle cx={CX} cy={CY} r={INNER_R} fill="none" stroke="#ebebeb" strokeWidth={0.5} />

        {/* Current year ring — dashed orbit */}
        <circle cx={CX} cy={CY} r={dot.r}
          fill="none" stroke="#d0d0d0" strokeWidth={1.5}
          strokeDasharray="3 5" />

        {/* Hand from center */}
        <line x1={CX} y1={CY} x2={dot.x} y2={dot.y}
          stroke="#e0e0e0" strokeWidth={1} />

        {/* Dot */}
        <circle cx={dot.x} cy={dot.y} r={active ? 7 : 6}
          fill={active ? '#666' : '#999'} />

        {/* Year in center */}
        <text x={CX} y={CY - 6}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={30} fontWeight={300}
          fill="#c0c0c0"
          fontFamily="Helvetica, Arial, sans-serif"
          letterSpacing="-0.02em">
          {date.year}
        </text>

        {/* Month + day under year */}
        <text x={CX} y={CY + 19}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fill="#d0d0d0"
          fontFamily="Helvetica, Arial, sans-serif"
          letterSpacing="0.1em">
          {MONTH_ABBR[date.month - 1].toUpperCase()} {date.day}
        </text>
      </svg>

      {/* Date output */}
      <div style={{
        fontSize: 80,
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
