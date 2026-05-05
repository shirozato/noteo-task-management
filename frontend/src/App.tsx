import { useState, useEffect } from 'react'
import { BottomNav } from './components/BottomNav'
import { TasksPage } from './pages/TasksPage'
import { HabitsPage } from './pages/HabitsPage'
import { SleepPage } from './pages/SleepPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ProfilePage } from './pages/ProfilePage'
import type { TabId } from './types'

const PAGES: Record<TabId, () => JSX.Element> = {
  tasks:     TasksPage,
  habits:    HabitsPage,
  sleep:     SleepPage,
  analytics: AnalyticsPage,
  profile:   ProfilePage,
}

export function App() {
  const [tab, setTab] = useState<TabId>('habits')
  const [prevTab, setPrevTab] = useState<TabId | null>(null)

  useEffect(() => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    const handler = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const handleTabChange = (t: TabId) => {
    if (t !== tab) { setPrevTab(tab); setTab(t) }
  }

  const Page = PAGES[tab]

  return (
    <div style={{
      width: '100%', height: '100%', maxWidth: 480, margin: '0 auto',
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg,#0a0b1e 0%,#07081a 100%)',
    }}>
      {/* Ambient background blobs */}
      <div style={{
        position: 'absolute', top: -80, left: -60, width: 300, height: 300,
        borderRadius: '50%', background: 'rgba(139,92,246,0.08)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: 100, right: -80, width: 250, height: 250,
        borderRadius: '50%', background: 'rgba(59,130,246,0.06)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        <Page key={tab} />
        <BottomNav active={tab} onChange={handleTabChange} />
      </div>
    </div>
  )
}
