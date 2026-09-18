import { useEffect, useState } from 'react'
import DatePicker01 from './versions/DatePicker01'
import DatePicker02 from './versions/DatePicker02'
import DatePicker03 from './versions/DatePicker03'
import DatePicker04 from './versions/DatePicker04'
import DatePicker05 from './versions/DatePicker05'
import DatePicker06 from './versions/DatePicker06'
import DatePicker07 from './versions/DatePicker07'
import DatePicker08 from './versions/DatePicker08'
import DatePicker09 from './versions/DatePicker09'
import DatePicker10 from './versions/DatePicker10'
import DatePicker11 from './versions/DatePicker11'
import DatePicker12 from './versions/DatePicker12'

const versions = [
  { id: '01', slug: 'cycle', name: 'Cycle', hint: 'click month, day, or year to advance it', component: DatePicker01 },
  { id: '02', slug: 'roll',  name: 'Roll',  hint: 'hover a number, drift toward its edge to spin', component: DatePicker02 },
  { id: '03', slug: 'pad',   name: 'Pad',   hint: 'drag the dot — across for day, down for year', component: DatePicker03 },
  { id: '04', slug: 'orbit', name: 'Orbit', hint: 'drag around the dial for day, outward for year', component: DatePicker04 },
  { id: '05', slug: 'type',  name: 'Type',  hint: 'type a date, any format', component: DatePicker05 },
  { id: '06', slug: 'bands', name: 'Bands', hint: 'sweep the bands — month, day, then year', component: DatePicker06 },
  { id: '07', slug: 'flick', name: 'Flick', hint: 'flick the wheels — they coast and snap', component: DatePicker07 },
  { id: '08', slug: 'grid',  name: 'Grid',  hint: 'the whole year at once — click a day, drag the rail for year', component: DatePicker08 },
  { id: '09', slug: 'sling', name: 'Sling', hint: 'pull from today and let go — further is farther', component: DatePicker09 },
  { id: '10', slug: 'ago',   name: 'Ago',   hint: 'drag through time — up for the past, down for the future', component: DatePicker10 },
  { id: '11', slug: 'zoom',  name: 'Zoom',  hint: 'drill in — decade, year, month, day', component: DatePicker11 },
  { id: '12', slug: 'fate',  name: 'Fate',  hint: 'lock what you like, roll the rest', component: DatePicker12 },
]

function fromHash() {
  const h = window.location.hash.replace('#', '').toLowerCase()
  const match = versions.find(v => v.slug === h || v.id === h)
  return match ? match.id : '01'
}

export default function App() {
  const [activeId, setActiveId] = useState(fromHash)
  const active = versions.find(v => v.id === activeId)
  const Component = active.component

  useEffect(() => {
    const onHash = () => setActiveId(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function select(v) {
    setActiveId(v.id)
    history.replaceState(null, '', '#' + v.slug)
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', background: '#fff' }}>
      {/* Left nav */}
      <nav style={{
        width: 96,
        borderRight: '1px solid #ebebeb',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 28,
        paddingLeft: 20,
        gap: 13,
        overflowY: 'auto',
        flexShrink: 0,
      }}>
        {versions.map(v => (
          <div
            key={v.id}
            onClick={() => select(v)}
            style={{
              fontFamily: 'Helvetica, Arial, sans-serif',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'color 0.15s',
            }}
          >
            <div style={{
              fontSize: 12,
              letterSpacing: '0.08em',
              color: v.id === activeId ? '#333' : '#ccc',
            }}>
              {v.id}
            </div>
            <div style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginTop: 2,
              color: v.id === activeId ? '#999' : '#ddd',
            }}>
              {v.name}
            </div>
          </div>
        ))}
      </nav>

      {/* Main area */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <Component />

        {/* Key for the active picker */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#c8c8c8',
          fontFamily: 'Helvetica, Arial, sans-serif',
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
          {active.name} · {active.hint}
        </div>
      </div>
    </div>
  )
}
