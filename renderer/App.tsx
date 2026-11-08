import React, { useState, useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { ScanButton } from './components/ScanButton'
import { useScan } from './hooks/useScan'
import { PythonDetail } from './components/drilldown/PythonDetail'
import { NodeDetail } from './components/drilldown/NodeDetail'
import { StorageDetail } from './components/drilldown/StorageDetail'
import { PathDetail } from './components/drilldown/PathDetail'
import { HistoryPanel } from './components/HistoryPanel'
import { Settings } from './components/Settings'

type ActiveView = 'dashboard' | 'python' | 'node' | 'storage' | 'path' | 'history' | 'settings'

export default function App(): React.JSX.Element {
  const { scan, isScanning, triggerScan } = useScan()
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [isFirstLaunch, setIsFirstLaunch] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    window.devdoc.isFirstLaunch().then(first => {
      if (first) {
        setIsFirstLaunch(true)
        window.devdoc.markLaunched()
        triggerScan()
      } else {
        window.devdoc.getLatestScan().then(latest => {
          if (!latest) triggerScan()
        })
      }
    })
  }, [])

  const navItems: { id: ActiveView; label: string }[] = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ]

  const isDetailView = ['python', 'node', 'storage', 'path'].includes(activeView)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 44,
        borderBottom: '1px solid #1a1a1d',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>DevDoc</span>
          {!isDetailView && (
            <nav style={{ display: 'flex', gap: 2 }}>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeView === item.id ? '#222' : 'transparent',
                    color: activeView === item.id ? '#fff' : '#666',
                    transition: 'color 0.1s, background 0.1s',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
          {isDetailView && (
            <button
              onClick={() => setActiveView('dashboard')}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: 'transparent',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ← Overview
            </button>
          )}
        </div>
        <ScanButton isScanning={isScanning} lastScanTime={scan?.timestamp ?? null} onScan={triggerScan} />
      </header>

      {/* Content */}
      <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
        {activeView === 'dashboard' && scan && (
          <Dashboard
            scan={scan}
            isFirstLaunch={isFirstLaunch && !bannerDismissed}
            onCardClick={setActiveView}
            onDismissBanner={() => setBannerDismissed(true)}
          />
        )}
        {activeView === 'dashboard' && !scan && (
          <div style={{ flex: 1, color: '#555', textAlign: 'center', paddingTop: 80, fontSize: 14 }}>
            {isScanning ? 'Scanning your environment…' : 'Run a scan to get started.'}
          </div>
        )}
        {activeView === 'python' && scan && <PythonDetail scan={scan} onBack={() => setActiveView('dashboard')} />}
        {activeView === 'node' && scan && <NodeDetail scan={scan} onBack={() => setActiveView('dashboard')} />}
        {activeView === 'storage' && scan && <StorageDetail scan={scan} onBack={() => setActiveView('dashboard')} />}
        {activeView === 'path' && scan && <PathDetail scan={scan} onBack={() => setActiveView('dashboard')} />}
        {activeView === 'history' && <HistoryPanel onBack={() => setActiveView('dashboard')} />}
        {activeView === 'settings' && <Settings onBack={() => setActiveView('dashboard')} />}
      </main>
    </div>
  )
}
