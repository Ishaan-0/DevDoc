import React from 'react'
import type { ScanResult } from '../../../src/types'

interface NodeCardProps {
  scan: ScanResult
  onClick: () => void
}

export function NodeCard({ scan, onClick }: NodeCardProps) {
  const { binary, issues } = scan.node
  const isHealthy = binary !== null && issues.length === 0
  const isMissing = binary === null
  const color = isMissing ? '#f87171' : isHealthy ? '#34d399' : '#fbbf24'
  const bigText = isMissing ? '—' : isHealthy ? 'OK' : String(issues.length)
  const subText = isMissing ? 'Not installed' : isHealthy ? 'No issues' : `issue${issues.length > 1 ? 's' : ''} found`

  return (
    <button onClick={onClick} style={cardStyle}>
      <div style={{ fontSize: 12, color: '#3a3a3f', fontWeight: 500, letterSpacing: '0.01em' }}>Node</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 8 }}>
          {bigText}
        </div>
        <div style={{ fontSize: 15, color, fontWeight: 400 }}>{subText}</div>
      </div>
      <div style={{ fontSize: 11, color: '#333' }}>
        {binary ? binary.version : 'No binary found'}
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
