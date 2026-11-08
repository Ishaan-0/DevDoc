import React from 'react'
import type { ScanResult } from '../../../src/types'
import { CopyButton } from '../CopyButton'

interface NodeDetailProps {
  scan: ScanResult
  onBack: () => void
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) {
    return `${(n / 1024 / 1024).toFixed(1)} MB`
  }
  return `${(n / 1024).toFixed(0)} KB`
}

export function NodeDetail({ scan, onBack }: NodeDetailProps) {
  const { binary, globalPackages, issues } = scan.node

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        ← Back
      </button>

      <section>
        <h2 className="text-lg font-semibold mb-3">Node Binary</h2>
        {binary === null ? (
          <p className="text-gray-400">Node not found on this system.</p>
        ) : (
          <div className="bg-gray-900 rounded p-3 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-gray-300">{binary.path}</span>
              <span className="text-sm text-gray-200">{binary.version}</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
              {binary.manager}
            </span>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Global Packages</h2>
        {globalPackages.length === 0 ? (
          <p className="text-gray-400">No global packages found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Version</th>
                <th className="pb-2 pr-4">Size</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {globalPackages.map((pkg, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-2 pr-4 text-gray-200">
                    {pkg.name}
                    {pkg.isUnused && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-amber-900 text-amber-300">
                        unused
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-gray-400">{pkg.version}</td>
                  <td className="py-2 pr-4 text-gray-400">{formatBytes(pkg.sizeBytes)}</td>
                  <td className="py-2">
                    {pkg.isUnused && (
                      <CopyButton command={`npm uninstall -g ${pkg.name}`} />
                    )}
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
