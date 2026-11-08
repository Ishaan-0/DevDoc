import React from 'react'
import type { ScanResult } from '../../../src/types'
import { CopyButton } from '../CopyButton'

interface NodeDetailProps {
  scan: ScanResult
  onBack: () => void
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024).toFixed(0)} KB`
}

export function NodeDetail({ scan }: NodeDetailProps) {
  const { binary, globalPackages, issues } = scan.node

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 32px', letterSpacing: '-0.02em' }}>Node</h2>

      <section style={{ marginBottom: 40 }}>
        <div style={sectionHeader}>Binary</div>
        {binary === null ? (
          <p style={emptyText}>Node not found on this system.</p>
        ) : (
          <div style={rowItem} className="selectable">
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'SF Mono, Fira Code, monospace', fontSize: 11, color: '#9999a8', marginBottom: 4 }}>{binary.path}</div>
              <div style={{ fontSize: 13, color: '#ccc' }}>{binary.version}</div>
            </div>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#1e1e22', color: '#888' }}>{binary.manager}</span>
          </div>
        )}
      </section>

      <section style={{ marginBottom: 40 }}>
        <div style={sectionHeader}>Global Packages</div>
        {globalPackages.length === 0 ? (
          <p style={emptyText}>No global packages found.</p>
        ) : (
          <div style={tableWrap} className="selectable">
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Version</th>
                  <th style={th}>Size</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {globalPackages.map((pkg, i) => (
                  <tr key={i}>
                    <td style={td}>
                      <span style={{ color: '#ccc' }}>{pkg.name}</span>
                      {pkg.isUnused && (
                        <span style={{ marginLeft: 6, fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#2a2010', color: '#fbbf24' }}>unused</span>
                      )}
                    </td>
                    <td style={{ ...td, color: '#555' }}>{pkg.version}</td>
                    <td style={{ ...td, color: '#555' }}>{formatBytes(pkg.sizeBytes)}</td>
                    <td style={td}>
                      {pkg.isUnused && <CopyButton command={`npm uninstall -g ${pkg.name}`} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {issues.length > 0 && (
        <section>
          <div style={sectionHeader}>Issues</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {issues.map((issue, i) => (
              <div key={i} style={{ ...rowItem, alignItems: 'flex-start' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: issue.severity === 'error' ? '#f87171' : '#fbbf24', flexShrink: 0, marginTop: 5 }} />
                <span style={{ fontSize: 13, color: '#ccc', flex: 1 }} className="selectable">{issue.message}</span>
                {issue.fixCommand && <CopyButton command={issue.fixCommand} />}
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
const tableWrap: React.CSSProperties = { width: '100%', overflowX: 'auto' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }
const th: React.CSSProperties = { textAlign: 'left', padding: '0 16px 10px 0', fontSize: 11, color: '#3a3a3f', fontWeight: 500, borderBottom: '1px solid #1a1a1d', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '13px 16px 13px 0', fontSize: 13, color: '#888', borderBottom: '1px solid #111' }
const rowItem: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, background: '#0e0e11', border: '1px solid #1c1c20', borderRadius: 10, padding: '14px 18px' }
