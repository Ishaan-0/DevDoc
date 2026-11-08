import React from 'react'
import type { ScanResult } from '../../../src/types'

interface PythonCardProps {
  scan: ScanResult
  onClick: () => void
}

export function PythonCard({ scan, onClick }: PythonCardProps) {
  const { binaries, venvs, issues } = scan.python
  const isHealthy = issues.length === 0
  const n = issues.length
  const issueLabel = n > 0 ? `${n} issue${n > 1 ? 's' : ''}` : null
  const summary = `${binaries.length} ${binaries.length === 1 ? 'binary' : 'binaries'}, ${venvs.length} venvs`

  return (
    <div className="bg-gray-900 rounded-xl p-5 flex flex-col gap-3 border border-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-white">Python</span>
        {isHealthy ? (
          <span className="text-green-400 text-sm">✅ healthy</span>
        ) : (
          <span className="text-amber-400 text-sm">⚠️ <span>{issueLabel}</span></span>
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
