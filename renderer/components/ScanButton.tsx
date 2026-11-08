import React, { useState, useEffect } from 'react'

interface ScanButtonProps {
  isScanning: boolean
  lastScanTime: number | null
  onScan: () => void
}

function useRelativeTime(timestamp: number | null): string | null {
  const [ago, setAgo] = useState<string | null>(null)

  useEffect(() => {
    if (!timestamp) { setAgo(null); return }

    const update = () => {
      const diff = Math.round((Date.now() - timestamp) / 60000)
      setAgo(diff < 1 ? 'just now' : `${diff}m ago`)
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [timestamp])

  return ago
}

export function ScanButton({ isScanning, lastScanTime, onScan }: ScanButtonProps) {
  const ago = useRelativeTime(lastScanTime)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {ago && !isScanning && (
        <span style={{ fontSize: 11, color: '#555' }}>{ago}</span>
      )}
      <button
        onClick={onScan}
        disabled={isScanning}
        style={{
          fontSize: 12,
          padding: '5px 14px',
          borderRadius: 6,
          border: '1px solid #333',
          cursor: isScanning ? 'default' : 'pointer',
          background: isScanning ? '#1a1a1d' : '#1e1e3a',
          color: isScanning ? '#555' : '#a5b4fc',
          transition: 'all 0.15s',
          fontFamily: 'inherit',
          letterSpacing: '-0.01em',
        }}
      >
        {isScanning ? 'Scanning…' : 'Scan'}
      </button>
    </div>
  )
}
