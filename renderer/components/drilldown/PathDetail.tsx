import React from 'react'
import type { ScanResult } from '../../../src/types'
import { CopyButton } from '../CopyButton'

interface PathDetailProps {
  scan: ScanResult
  onBack: () => void
}

export function PathDetail({ scan, onBack }: PathDetailProps) {
  const { entries, issues } = scan.path

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        ← Back
      </button>

      <section>
        <h2 className="text-lg font-semibold mb-3">PATH Entries</h2>
        {entries.length === 0 ? (
          <p className="text-gray-400">No PATH entries found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-2 pr-3 w-8">#</th>
                <th className="pb-2 pr-4">Path</th>
                <th className="pb-2 pr-4">Exists</th>
                <th className="pb-2 pr-4">Duplicate</th>
                <th className="pb-2">Wins</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-2 pr-3 text-gray-500 text-xs">{i + 1}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-300 break-all">{entry.path}</td>
                  <td className="py-2 pr-4 text-center">{entry.exists ? '✅' : '❌'}</td>
                  <td className="py-2 pr-4">
                    {entry.isDuplicate && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900 text-amber-300">
                        duplicate
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-xs text-gray-400">
                    {entry.wins.length > 0 ? entry.wins.join(', ') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Issues</h2>
        {issues.length === 0 ? (
          <p className="text-gray-400">No PATH issues found.</p>
        ) : (
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <div key={i} className="bg-gray-900 rounded p-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span>{issue.severity === 'error' ? '🔴' : '⚠️'}</span>
                  <span className="text-sm text-gray-200">{issue.message}</span>
                </div>
                {issue.fixCommand && (
                  <div className="flex-shrink-0">
                    <CopyButton command={issue.fixCommand} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
