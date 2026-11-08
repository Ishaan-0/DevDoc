import React from 'react'
import type { ScanResult } from '../../../src/types'
import { CopyButton } from '../CopyButton'

interface PythonDetailProps {
  scan: ScanResult
  onBack: () => void
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) {
    return `${(n / 1024 / 1024).toFixed(1)} MB`
  }
  return `${(n / 1024).toFixed(0)} KB`
}

export function PythonDetail({ scan, onBack }: PythonDetailProps) {
  const { binaries, venvs, issues } = scan.python

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        ← Back
      </button>

      <section>
        <h2 className="text-lg font-semibold mb-3">Python Binaries</h2>
        {binaries.length === 0 ? (
          <p className="text-gray-400">No Python binaries found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-2 pr-4">Path</th>
                <th className="pb-2 pr-4">Version</th>
                <th className="pb-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {binaries.map((bin, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-2 pr-4 font-mono text-xs text-gray-300">{bin.path}</td>
                  <td className="py-2 pr-4 text-gray-200">{bin.version}</td>
                  <td className="py-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                      {bin.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Virtual Environments</h2>
        {venvs.length === 0 ? (
          <p className="text-gray-400">No virtual environments found.</p>
        ) : (
          <div className="space-y-2">
            {venvs.map((venv, i) => (
              <div key={i} className="bg-gray-900 rounded p-3 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs text-gray-300 break-all">{venv.path}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    {venv.isBroken && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-900 text-red-300">broken</span>
                    )}
                    {venv.isNested && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-900 text-amber-300">nested</span>
                    )}
                    {venv.isOrphaned && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-900 text-amber-300">orphaned</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Python {venv.pythonVersion}</span>
                  <span>{formatBytes(venv.sizeBytes)}</span>
                  <span>Modified {new Date(venv.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Issues</h2>
        {issues.length === 0 ? (
          <p className="text-gray-400">No issues found.</p>
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
