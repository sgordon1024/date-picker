import { useState } from 'react'

const today = new Date()
const CURRENT_MONTH = today.getMonth() + 1  // 1–12
const CURRENT_DAY   = today.getDate()        // 1–31
const CURRENT_YEAR  = today.getFullYear()

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate()
}

// Build a cycling array of values starting from `start`, wrapping within [min, max]
function nextInCycle(current, min, max) {
  return current >= max ? min : current + 1
}

export default function DatePicker01() {
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [day,   setDay]   = useState(CURRENT_DAY)
  const [year,  setYear]  = useState(CURRENT_YEAR)

  function handleMonthClick() {
    const next = nextInCycle(month, 1, 12)
    setMonth(next)
    // clamp day if new month has fewer days
    const maxDay = daysInMonth(next, year)
    if (day > maxDay) setDay(maxDay)
  }

  function handleDayClick() {
    const maxDay = daysInMonth(month, year)
    setDay(nextInCycle(day, 1, maxDay))
  }

  function handleYearClick() {
    setYear(y => y + 1)
  }

  const pad = n => String(n).padStart(2, '0')
  const output = `${pad(month)}/${pad(day)}/${year}`

  const segmentStyle = {
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'color 0.1s',
    lineHeight: 1,
  }

  const separatorStyle = {
    color: '#d0d0d0',
    lineHeight: 1,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>

      {/* The date display */}
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
          style={segmentStyle}
          onClick={handleMonthClick}
          title="click to change month"
        >
          {pad(month)}
        </span>

        <span style={separatorStyle}>/</span>

        <span
          style={segmentStyle}
          onClick={handleDayClick}
          title="click to change day"
        >
          {pad(day)}
        </span>

        <span style={separatorStyle}>/</span>

        <span
          style={segmentStyle}
          onClick={handleYearClick}
          title="click to change year"
        >
          {year}
        </span>
      </div>

      {/* Output label */}
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
