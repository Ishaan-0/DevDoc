import React from 'react'
import type { ScanResult } from '../../../src/types'

interface StorageCardProps {
  scan: ScanResult
  onClick: () => void
}

export function StorageCard({ scan, onClick }: StorageCardProps) {
  const { brokenVenvs, unusedGlobalPackages } = scan.storage
  const isHealthy = brokenVenvs.length === 0 && unusedGlobalPackages.length === 0
  const n = brokenVenvs.length + unusedGlobalPackages.length
  const issueLabel = n > 0 ? `${n} issue${n > 1 ? 's' : ''}` : null
  const summary = `${brokenVenvs.length} broken, ${unusedGlobalPackages.length} unused`

  return (
    <div className="bg-gray-900 rounded-xl p-5 flex flex-col gap-3 border border-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-white">Storage</span>
        {isHealthy ? (
          <span className="text-green-400 text-sm">✅ healthy</span>
        ) : (
          <span className="text-amber-400 text-sm">⚠️ {issueLabel}</span>
        )}
      </div>
      <p className="text-gray-400 text-sm">{summary}</p>
      <button
        onClick={onClick}
        className="mt-auto text-blue-400 text-sm self-end hover:text-blue-300"
      >
        View →
      </button>
    </div>
  )
}
