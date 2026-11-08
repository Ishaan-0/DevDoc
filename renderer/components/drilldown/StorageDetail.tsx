import React from 'react'
import type { ScanResult } from '../../../src/types'
import { CopyButton } from '../CopyButton'

interface StorageDetailProps {
  scan: ScanResult
  onBack: () => void
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024).toFixed(0)} KB`
}

export function StorageDetail({ scan }: StorageDetailProps) {
  const { brokenVenvs, nestedVenvs, orphanedVenvs, unusedGlobalPackages, largestItems } = scan.storage
  const top20 = largestItems.slice(0, 20)
  const hasAnything = brokenVenvs.length + nestedVenvs.length + orphanedVenvs.length + unusedGlobalPackages.length + top20.length > 0

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 32px', letterSpacing: '-0.02em' }}>Storage</h2>

      {!hasAnything && <p style={emptyText}>Nothing to review.</p>}

      {brokenVenvs.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={sectionHeader}>Broken Virtual Environments</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {brokenVenvs.map((v, i) => (
              <div key={i} style={rowItem} className="selectable">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'SF Mono, Fira Code, monospace', fontSize: 11, color: '#9999a8', wordBreak: 'break-all', marginBottom: 2 }}>{v.path}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{formatBytes(v.sizeBytes)}</div>
                </div>
                <CopyButton command={`rm -rf "${v.path}"`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {nestedVenvs.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={sectionHeader}>Nested Virtual Environments</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {nestedVenvs.map((v, i) => (
              <div key={i} style={rowItem} className="selectable">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'SF Mono, Fira Code, monospace', fontSize: 11, color: '#9999a8', wordBreak: 'break-all', marginBottom: 2 }}>{v.path}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{formatBytes(v.sizeBytes)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {orphanedVenvs.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={sectionHeader}>Orphaned Virtual Environments</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {orphanedVenvs.map((v, i) => (
              <div key={i} style={rowItem} className="selectable">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'SF Mono, Fira Code, monospace', fontSize: 11, color: '#9999a8', wordBreak: 'break-all', marginBottom: 2 }}>{v.path}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{formatBytes(v.sizeBytes)}</div>
                </div>
                <CopyButton command={`rm -rf "${v.path}"`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {unusedGlobalPackages.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={sectionHeader}>Unused Global Packages</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {unusedGlobalPackages.map((pkg, i) => (
              <div key={i} style={rowItem} className="selectable">
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: '#ccc' }}>{pkg.name}</span>
                  <span style={{ fontSize: 11, color: '#555' }}>{pkg.version}</span>
                  <span style={{ fontSize: 11, color: '#555' }}>{formatBytes(pkg.sizeBytes)}</span>
                </div>
                <CopyButton command={`npm uninstall -g ${pkg.name}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {top20.length > 0 && (
        <section>
          <div style={sectionHeader}>Largest Items</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {top20.map((item, i) => (
              <div key={i} style={{ ...rowItem, alignItems: 'center' }} className="selectable">
                <span style={{ fontSize: 11, color: '#333', width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#ccc', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontFamily: 'SF Mono, Fira Code, monospace', fontSize: 10, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.path}</div>
                </div>
                <span style={{ fontSize: 11, color: '#555', flexShrink: 0 }}>{formatBytes(item.sizeBytes)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const sectionHeader: React.CSSProperties = { fontSize: 11, color: '#3a3a3f', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }
const emptyText: React.CSSProperties = { fontSize: 14, color: '#3a3a3f', margin: 0 }
const rowItem: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, background: '#0e0e11', border: '1px solid #1c1c20', borderRadius: 10, padding: '14px 18px' }
