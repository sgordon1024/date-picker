import { useState } from 'react'

// 11 · ZOOM — drill down: decade → year → month → day

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DECADES = Array.from({ length: 12 }, (_, i) => 1920 + i * 10)
const today = new Date()

function daysInMonth(m, y) { return new Date(y, m, 0).getDate() }

function Cell({ label, dim, onClick, w = 92 }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: w, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 10,
        background: hover ? '#e9e9e9' : '#f4f4f4',
        color: hover ? '#777' : dim ? '#d0d0d0' : '#aaa',
        fontSize: 15, fontWeight: 300, letterSpacing: '0.02em',
        cursor: 'pointer', userSelect: 'none',
        transition: 'background 0.1s, color 0.1s, transform 0.1s',
        transform: hover ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {label}
    </div>
  )
}

export default function DatePicker11() {
  const [stage, setStage] = useState('decade')   // decade | year | month | day
  const [decade, setDecade] = useState(Math.floor(today.getFullYear() / 10) * 10)
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [day, setDay] = useState(today.getDate())

  const p = n => String(n).padStart(2, '0')
  const output = `${p(month)}/${p(day)}/${year}`

  const crumbStyle = (active) => ({
    fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
    color: active ? '#888' : '#ccc', cursor: 'pointer', userSelect: 'none',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, fontFamily: 'Helvetica, Arial, sans-serif' }}>

      {/* breadcrumb */}
      <div style={{ display: 'flex', gap: 18, height: 14 }}>
        <span style={crumbStyle(stage === 'decade')} onClick={() => setStage('decade')}>{decade}s</span>
        <span style={crumbStyle(stage === 'year')} onClick={() => setStage('year')}>{year}</span>
        <span style={crumbStyle(stage === 'month')} onClick={() => setStage('month')}>{MONTH_ABBR[month - 1]}</span>
        <span style={crumbStyle(stage === 'day')} onClick={() => setStage('day')}>{p(day)}</span>
      </div>

      {/* stage panel */}
      <div key={stage} style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
        width: 640, minHeight: 190, alignContent: 'flex-start',
        animation: 'zoomIn 0.18s ease',
      }}>
        <style>{`@keyframes zoomIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }`}</style>

        {stage === 'decade' && DECADES.map(d => (
          <Cell key={d} label={`${d}s`} onClick={() => { setDecade(d); setStage('year') }} />
        ))}

        {stage === 'year' && Array.from({ length: 10 }, (_, i) => decade + i).map(y => (
          <Cell key={y} label={y} onClick={() => {
            setYear(y)
            if (day > daysInMonth(month, y)) setDay(daysInMonth(month, y))
            setStage('month')
          }} />
        ))}

        {stage === 'month' && MONTH_NAMES.map((name, i) => (
          <Cell key={name} label={name} w={148} onClick={() => {
            setMonth(i + 1)
            if (day > daysInMonth(i + 1, year)) setDay(daysInMonth(i + 1, year))
            setStage('day')
          }} />
        ))}

        {stage === 'day' && Array.from({ length: daysInMonth(month, year) }, (_, i) => i + 1).map(d => (
          <Cell key={d} label={d} w={52} onClick={() => setDay(d)} />
        ))}
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
