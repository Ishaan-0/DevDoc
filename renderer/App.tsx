import React, { useState, useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { ScanButton } from './components/ScanButton'
import { useScan } from './hooks/useScan'
import type { ScanResult } from '../src/types'

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

  const handleDismissBanner = () => {
    setBannerDismissed(true)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">DevDoc</h1>
          <ScanButton isScanning={isScanning} lastScanTime={scan?.timestamp ?? null} onScan={triggerScan} />
        </div>
        {activeView === 'dashboard' && scan && (
          <Dashboard
            scan={scan}
            isFirstLaunch={isFirstLaunch && !bannerDismissed}
            onCardClick={setActiveView}
            onDismissBanner={handleDismissBanner}
          />
        )}
        {activeView === 'dashboard' && !scan && (
          <div className="text-gray-400 text-center py-20">
            {isScanning ? 'Scanning…' : 'No scan yet. Click Scan Now.'}
          </div>
        )}
        {activeView !== 'dashboard' && (
          <div>
            <button onClick={() => setActiveView('dashboard')} className="mb-4 text-blue-400">← Back</button>
            <p className="text-gray-400">Detail view for {activeView} — coming in Task 8</p>
          </div>
        )}
      </div>
    </div>
  )
}
