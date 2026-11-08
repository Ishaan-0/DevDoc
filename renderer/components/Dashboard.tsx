import React from 'react'
import type { ScanResult } from '../../src/types'
import { PythonCard } from './cards/PythonCard'
import { NodeCard } from './cards/NodeCard'
import { StorageCard } from './cards/StorageCard'
import { PathCard } from './cards/PathCard'
import { FirstLaunchBanner } from './FirstLaunchBanner'

interface DashboardProps {
  scan: ScanResult
  isFirstLaunch?: boolean
  onCardClick: (view: 'python' | 'node' | 'storage' | 'path') => void
  onDismissBanner?: () => void
}

export function Dashboard({ scan, isFirstLaunch, onCardClick, onDismissBanner }: DashboardProps) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {isFirstLaunch && (
        <FirstLaunchBanner onDismiss={onDismissBanner ?? (() => {})} />
      )}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 12,
      }}>
        <PythonCard scan={scan} onClick={() => onCardClick('python')} />
        <NodeCard scan={scan} onClick={() => onCardClick('node')} />
        <StorageCard scan={scan} onClick={() => onCardClick('storage')} />
        <PathCard scan={scan} onClick={() => onCardClick('path')} />
      </div>
    </div>
  )
}
