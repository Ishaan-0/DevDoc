import React from 'react'
import type { ScanResult } from '../../../src/types'
import { CopyButton } from '../CopyButton'

interface StorageDetailProps {
  scan: ScanResult
  onBack: () => void
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) {
    return `${(n / 1024 / 1024).toFixed(1)} MB`
  }
  return `${(n / 1024).toFixed(0)} KB`
}

export function StorageDetail({ scan, onBack }: StorageDetailProps) {
  const { brokenVenvs, nestedVenvs, orphanedVenvs, unusedGlobalPackages, largestItems } = scan.storage
  const top20 = largestItems.slice(0, 20)

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        ← Back
      </button>

      {brokenVenvs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Broken Virtual Environments</h2>
          <div className="space-y-2">
            {brokenVenvs.map((v, i) => (
              <div key={i} className="bg-gray-900 rounded p-3 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-gray-300 break-all">{v.path}</span>
                  <span className="text-xs text-gray-400">{formatBytes(v.sizeBytes)}</span>
                </div>
                <div className="flex-shrink-0">
                  <CopyButton command={`rm -rf "${v.path}"`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {nestedVenvs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Nested Virtual Environments</h2>
          <div className="space-y-2">
            {nestedVenvs.map((v, i) => (
              <div key={i} className="bg-gray-900 rounded p-3 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-gray-300 break-all">{v.path}</span>
                  <span className="text-xs text-gray-400">{formatBytes(v.sizeBytes)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {orphanedVenvs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Orphaned Virtual Environments</h2>
          <div className="space-y-2">
            {orphanedVenvs.map((v, i) => (
              <div key={i} className="bg-gray-900 rounded p-3 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs text-gray-300 break-all">{v.path}</span>
                  <span className="text-xs text-gray-400">{formatBytes(v.sizeBytes)}</span>
                </div>
                <div className="flex-shrink-0">
                  <CopyButton command={`rm -rf "${v.path}"`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {unusedGlobalPackages.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Unused Global Packages</h2>
          <div className="space-y-2">
            {unusedGlobalPackages.map((pkg, i) => (
              <div key={i} className="bg-gray-900 rounded p-3 flex items-center justify-between gap-3">
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-gray-200">{pkg.name}</span>
                  <span className="text-xs text-gray-400">{pkg.version}</span>
                  <span className="text-xs text-gray-400">{formatBytes(pkg.sizeBytes)}</span>
                </div>
                <div className="flex-shrink-0">
                  <CopyButton command={`npm uninstall -g ${pkg.name}`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {top20.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Largest Items</h2>
          <div className="space-y-1">
            {top20.map((item, i) => (
              <div key={i} className="bg-gray-900 rounded p-3 flex items-center gap-3">
                <span className="text-xs text-gray-500 w-5 text-right">{i + 1}</span>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm text-gray-200">{item.label}</span>
                  <span className="font-mono text-xs text-gray-400 truncate">{item.path}</span>
                </div>
                <span className="text-xs text-gray-300 flex-shrink-0">{formatBytes(item.sizeBytes)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {brokenVenvs.length === 0 && nestedVenvs.length === 0 && orphanedVenvs.length === 0 &&
       unusedGlobalPackages.length === 0 && top20.length === 0 && (
        <p className="text-gray-400">No storage issues found.</p>
      )}
    </div>
  )
}
