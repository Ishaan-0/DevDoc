import React from 'react'

interface ScanButtonProps {
  isScanning: boolean
  lastScanTime: number | null
  onScan: () => void
}

export function ScanButton({ isScanning, lastScanTime, onScan }: ScanButtonProps) {
  const label = isScanning ? 'Scanning…' : 'Scan Now'
  const ago = lastScanTime
    ? `Last scanned ${Math.round((Date.now() - lastScanTime) / 60000)} min ago`
    : 'Never scanned'
  return (
    <div>
      <button onClick={onScan} disabled={isScanning}>{label}</button>
      <span>{ago}</span>
    </div>
  )
}
