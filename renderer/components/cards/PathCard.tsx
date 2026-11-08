import React from 'react'
import type { ScanResult } from '../../../src/types'

interface PathCardProps {
  scan: ScanResult
  onClick: () => void
}

export function PathCard({ scan, onClick }: PathCardProps) {
  const { entries, issues } = scan.path
  const isHealthy = issues.length === 0
  const color = isHealthy ? '#34d399' : '#fbbf24'

  return (
    <button onClick={onClick} style={cardStyle}>
      <div style={{ fontSize: 12, color: '#3a3a3f', fontWeight: 500, letterSpacing: '0.01em' }}>PATH</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 8 }}>
          {isHealthy ? 'OK' : issues.length}
        </div>
        <div style={{ fontSize: 15, color, fontWeight: 400 }}>
          {isHealthy ? 'No issues' : `issue${issues.length > 1 ? 's' : ''} found`}
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#333' }}>
        {entries.length} entries
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
