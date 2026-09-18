import { useRef, useState, useEffect, useCallback } from 'react'

// 07 · FLICK — momentum wheels: drag, release, coast, snap

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MIN_YEAR = 1920
const MAX_YEAR = 2030
const CELL = 56
const today = new Date()

function daysInMonth(m, y) { return new Date(y, m, 0).getDate() }
function mod(n, m) { return ((n % m) + m) % m }

function Wheel({ items, index, onChange, wrap, width = 96, render }) {
  const [offset, setOffset] = useState(0)   // px offset from rest
  const dragRef = useRef(null)              // { startY, startOffset, lastY, lastT, v }
  const rafRef = useRef(null)
  const offsetRef = useRef(0)
  offsetRef.current = offset

  const commit = useCallback((steps) => {
    if (steps === 0) return
    let next = index + steps
    if (wrap) next = mod(next, items.length)
    else next = Math.max(0, Math.min(items.length - 1, next))
    onChange(next)
  }, [index, items.length, onChange, wrap])

  function stopRaf() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function settle(v0) {
    // coast with friction, then snap to nearest cell
    let v = v0
    let last = performance.now()
    function tick(t) {
      const dt = Math.min(t - last, 40); last = t
      v *= Math.pow(0.994, dt)
      let next = offsetRef.current + v * dt
      if (Math.abs(v) < 0.02) {
        const steps = Math.round(next / CELL)
        commit(-steps)
        setOffset(0)
        rafRef.current = null
        return
      }
      setOffset(next)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function onPointerDown(e) {
    e.preventDefault()
    stopRaf()
    dragRef.current = { startY: e.clientY, startOffset: offset, lastY: e.clientY, lastT: performance.now(), v: 0 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e) {
    const d = dragRef.current
    if (!d) return
    const now = performance.now()
    const dy = e.clientY - d.lastY
    const dt = Math.max(1, now - d.lastT)
    d.v = 0.8 * d.v + 0.2 * (dy / dt)
    d.lastY = e.clientY; d.lastT = now
    setOffset(d.startOffset + (e.clientY - d.startY))
  }
  function onPointerUp() {
    const d = dragRef.current
    if (!d) return
    dragRef.current = null
    settle(d.v)
  }

  useEffect(() => () => stopRaf(), [])

  // render 7 cells around center
  const cells = []
  const whole = Math.round(offset / CELL)
  const frac = offset - whole * CELL          // -CELL/2 .. CELL/2 residual
  for (let k = -3; k <= 3; k++) {
    const virtual = index - whole + k
    const i = wrap ? mod(virtual, items.length) : virtual
    const valid = wrap || (i >= 0 && i < items.length)
    const centerDist = Math.abs(k * CELL + frac) / CELL
    cells.push(
      <div key={k} style={{
        position: 'absolute',
        top: '50%', left: 0, right: 0,
        transform: `translateY(${k * CELL + frac - CELL / 2}px)`,
        height: CELL,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: centerDist < 0.5 ? 30 : 22,
        fontWeight: 300,
        color: valid ? (centerDist < 0.5 ? '#777' : '#d5d5d5') : 'transparent',
        userSelect: 'none',
        pointerEvents: 'none',
        transition: 'font-size 0.1s, color 0.1s',
      }}>
        {valid ? render(items[i]) : ''}
      </div>
    )
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'relative',
        width, height: CELL * 5,
        overflow: 'hidden',
        cursor: 'grab',
        touchAction: 'none',
        fontFamily: 'Helvetica, Arial, sans-serif',
        maskImage: 'linear-gradient(transparent, black 28%, black 72%, transparent)',
        WebkitMaskImage: 'linear-gradient(transparent, black 28%, black 72%, transparent)',
      }}
    >
      {cells}
      <div style={{ position: 'absolute', top: '50%', left: 8, right: 8, height: 1, background: '#eee', transform: `translateY(${-CELL / 2}px)` }} />
      <div style={{ position: 'absolute', top: '50%', left: 8, right: 8, height: 1, background: '#eee', transform: `translateY(${CELL / 2}px)` }} />
    </div>
  )
}

export default function DatePicker07() {
  const [monthI, setMonthI] = useState(today.getMonth())
  const [dayI, setDayI] = useState(today.getDate() - 1)
  const [yearI, setYearI] = useState(today.getFullYear() - MIN_YEAR)

  const year = MIN_YEAR + yearI
  const maxDay = daysInMonth(monthI + 1, year)
  const day = Math.min(dayI + 1, maxDay)

  const months = MONTH_ABBR
  const days = Array.from({ length: maxDay }, (_, i) => i + 1)
  const years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)

  const p = n => String(n).padStart(2, '0')
  const output = `${p(monthI + 1)}/${p(day)}/${year}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44 }}>
      <div style={{ display: 'flex', gap: 20 }}>
        <Wheel items={months} index={monthI} onChange={setMonthI} wrap render={v => v} />
        <Wheel items={days} index={Math.min(dayI, maxDay - 1)} onChange={setDayI} wrap render={v => p(v)} />
        <Wheel items={years} index={yearI} onChange={setYearI} wrap={false} width={120} render={v => v} />
      </div>
      <div style={{
        fontSize: 96, fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 300,
        color: '#999', letterSpacing: '-0.02em', lineHeight: 1, userSelect: 'none',
      }}>
        {output}
      </div>
    </div>
  )
}
