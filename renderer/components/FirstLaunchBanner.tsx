import React from 'react'

interface FirstLaunchBannerProps {
  onDismiss: () => void
}

export function FirstLaunchBanner({ onDismiss }: FirstLaunchBannerProps) {
  return (
    <div style={{
      background: '#0f1629',
      border: '1px solid #1e2a4a',
      borderRadius: 8,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    }}>
      <p style={{ fontSize: 12, color: '#8ba3d4', margin: 0, lineHeight: 1.5 }}>
        Scanning your home folder. Go to Settings to change which folders are searched.
      </p>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#4a6490',
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: 1,
          padding: '0 2px',
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
