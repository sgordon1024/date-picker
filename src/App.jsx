import { useState } from 'react'
import DatePicker01 from './versions/DatePicker01'
import DatePicker02 from './versions/DatePicker02'
import DatePicker03 from './versions/DatePicker03'
import DatePicker04 from './versions/DatePicker04'
import DatePicker05 from './versions/DatePicker05'
import DatePicker06 from './versions/DatePicker06'

const versions = [
  { id: '01', component: DatePicker01 },
  { id: '02', component: DatePicker02 },
  { id: '03', component: DatePicker03 },
  { id: '04', component: DatePicker04 },
  { id: '05', component: DatePicker05 },
  { id: '06', component: DatePicker06 },
]

export default function App() {
  const [activeId, setActiveId] = useState('01')
  const active = versions.find(v => v.id === activeId)
  const Component = active.component

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#fff' }}>
      {/* Left nav */}
      <nav style={{
        width: 64,
        borderRight: '1px solid #ebebeb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 32,
        gap: 24,
        flexShrink: 0,
      }}>
        {versions.map(v => (
          <div
            key={v.id}
            onClick={() => setActiveId(v.id)}
            style={{
              fontSize: 12,
              letterSpacing: '0.08em',
              color: v.id === activeId ? '#333' : '#ccc',
              fontFamily: 'Helvetica, Arial, sans-serif',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'color 0.15s',
            }}
          >
            {v.id}
          </div>
        ))}
      </nav>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Component />
      </div>
    </div>
  )
}
