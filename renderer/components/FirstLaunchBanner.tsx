import React from 'react'

interface FirstLaunchBannerProps {
  onDismiss: () => void
}

export function FirstLaunchBanner({ onDismiss }: FirstLaunchBannerProps) {
  return (
    <div className="bg-blue-900 border border-blue-700 rounded-xl p-4 flex items-start justify-between gap-4 mb-4">
      <p className="text-blue-100 text-sm">
        DevDoc is scanning your home folder by default. Go to Settings to change which folders are scanned.
      </p>
      <button
        onClick={onDismiss}
        className="text-blue-300 hover:text-white text-sm shrink-0"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
