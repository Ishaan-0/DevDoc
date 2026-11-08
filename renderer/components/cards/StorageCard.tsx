import React from 'react'
import type { ScanResult } from '../../../src/types'

interface StorageCardProps {
  scan: ScanResult
  onClick: () => void
}

export function StorageCard({ scan, onClick }: StorageCardProps) {
  const { brokenVenvs, unusedGlobalPackages } = scan.storage
  const n = brokenVenvs.length + unusedGlobalPackages.length
  const isHealthy = n === 0
  const color = isHealthy ? '#34d399' : '#fbbf24'

  return (
    <button onClick={onClick} style={cardStyle}>
      <div style={{ fontSize: 12, color: '#3a3a3f', fontWeight: 500, letterSpacing: '0.01em' }}>Storage</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 8 }}>
          {isHealthy ? 'OK' : n}
        </div>
        <div style={{ fontSize: 15, color, fontWeight: 400 }}>
          {isHealthy ? 'Nothing to clean' : `item${n > 1 ? 's' : ''} to review`}
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#333' }}>
        {brokenVenvs.length} broken · {unusedGlobalPackages.length} unused packages
      </div>
    </button>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#0e0e11',
  border: '1px solid #1c1c20',
  borderRadius: 14,
  padding: '22px 26px',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  cursor: 'pointer',
  width: '100%',
  height: '100%',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
}
