import React from 'react'
import type { ScanResult } from '../../../src/types'
import { CopyButton } from '../CopyButton'

interface PythonDetailProps {
  scan: ScanResult
  onBack: () => void
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024).toFixed(0)} KB`
}

const badge = (label: string, color: string, bg: string) => (
  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: bg, color, fontWeight: 500 }}>
    {label}
  </span>
)

export function PythonDetail({ scan }: PythonDetailProps) {
  const { binaries, venvs, issues } = scan.python

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 32px', letterSpacing: '-0.02em' }}>Python</h2>

      <section style={{ marginBottom: 40 }}>
        <div style={sectionHeader}>Binaries</div>
        {binaries.length === 0 ? (
          <p style={emptyText}>No Python binaries found.</p>
        ) : (
          <div style={tableWrap} className="selectable">
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Path</th>
                  <th style={th}>Version</th>
                  <th style={th}>Source</th>
                </tr>
              </thead>
              <tbody>
                {binaries.map((bin, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontFamily: 'SF Mono, Fira Code, monospace', fontSize: 11, color: '#9999a8' }}>{bin.path}</td>
                    <td style={{ ...td, color: '#ccc' }}>{bin.version}</td>
                    <td style={td}>{badge(bin.source, '#888', '#1e1e22')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginBottom: 40 }}>
        <div style={sectionHeader}>Virtual Environments</div>
        {venvs.length === 0 ? (
          <p style={emptyText}>No virtual environments found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {venvs.map((venv, i) => (
              <div key={i} style={rowItem} className="selectable">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'SF Mono, Fira Code, monospace', fontSize: 11, color: '#9999a8', wordBreak: 'break-all' }}>{venv.path}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {venv.isBroken && badge('broken', '#f87171', '#2a1515')}
                      {venv.isNested && badge('nested', '#fbbf24', '#2a2010')}
                      {venv.isOrphaned && badge('orphaned', '#fbbf24', '#2a2010')}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#555', display: 'flex', gap: 12 }}>
                    <span>Python {venv.pythonVersion}</span>
                    <span>{formatBytes(venv.sizeBytes)}</span>
                    <span>{new Date(venv.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
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
