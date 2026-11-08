import React, { useState } from 'react'
import { useHistory } from '../hooks/useHistory'
import { diffScans } from '../../src/diff/index'

export function HistoryPanel({ onBack }: { onBack: () => void }) {
  const { history, isLoading } = useHistory()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="p-4 text-gray-400">Loading…</div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="p-4">
        <button onClick={onBack} className="mb-4 text-blue-400 hover:text-blue-300">← Back</button>
        <p className="text-gray-400">No history yet.</p>
      </div>
    )
  }

  // Sort newest first
  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="p-4">
      <button onClick={onBack} className="mb-4 text-blue-400 hover:text-blue-300">← Back</button>
      <h2 className="text-xl font-semibold mb-4 text-white">Scan History</h2>
      <ul className="space-y-2">
        {sorted.map((entry, index) => {
          // Find the previous scan (older) for diff
          const prevEntry = sorted[index + 1]
          let summaryLine: string
          if (!prevEntry) {
            summaryLine = 'First scan'
          } else {
            const diff = diffScans(prevEntry.result, entry.result)
            const parts = diff.summary
            summaryLine = parts.length > 0 ? parts.join(', ') : 'No changes'
          }

          const isExpanded = expandedId === entry.id

          // Compute diff for expanded view
          const diff = prevEntry ? diffScans(prevEntry.result, entry.result) : null

          return (
            <li key={entry.id} className="bg-gray-900 rounded">
              <button
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-800 rounded"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <span className="text-sm text-gray-200">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-4">{summaryLine}</span>
              </button>
              {isExpanded && diff && (
                <div className="px-4 pb-3 text-xs text-gray-300 space-y-1 border-t border-gray-800 pt-2">
                  {diff.pythonVersionsAdded.length > 0 && (
                    <p>Python added: {diff.pythonVersionsAdded.join(', ')}</p>
                  )}
                  {diff.pythonVersionsRemoved.length > 0 && (
                    <p>Python removed: {diff.pythonVersionsRemoved.join(', ')}</p>
                  )}
                  {diff.venvsAdded.length > 0 && (
                    <p>Venvs added: {diff.venvsAdded.join(', ')}</p>
                  )}
                  {diff.venvsRemoved.length > 0 && (
                    <p>Venvs removed: {diff.venvsRemoved.join(', ')}</p>
                  )}
                  {diff.nodeVersionChanged && (
                    <p>Node version changed: {diff.nodeVersionChanged.from} → {diff.nodeVersionChanged.to}</p>
                  )}
                  {diff.globalPackagesAdded.length > 0 && (
                    <p>Global packages added: {diff.globalPackagesAdded.join(', ')}</p>
                  )}
                  {diff.globalPackagesRemoved.length > 0 && (
                    <p>Global packages removed: {diff.globalPackagesRemoved.join(', ')}</p>
                  )}
                </div>
              )}
              {isExpanded && !diff && (
                <div className="px-4 pb-3 text-xs text-gray-400 border-t border-gray-800 pt-2">
                  First scan — no previous data to compare.
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
