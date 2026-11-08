import React from 'react'
import type { ScanResult } from '../../../src/types'
import { CopyButton } from '../CopyButton'

interface PathDetailProps {
  scan: ScanResult
  onBack: () => void
}

export function PathDetail({ scan }: PathDetailProps) {
  const { entries, issues } = scan.path

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 32px', letterSpacing: '-0.02em' }}>PATH</h2>

      <section style={{ marginBottom: 40 }}>
        <div style={sectionHeader}>Entries</div>
        {entries.length === 0 ? (
          <p style={emptyText}>No PATH entries found.</p>
        ) : (
          <div style={tableWrap} className="selectable">
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...th, width: 32 }}>#</th>
                  <th style={th}>Path</th>
                  <th style={{ ...th, width: 60 }}>Exists</th>
                  <th style={th}>Flags</th>
                  <th style={th}>Wins</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={i}>
                    <td style={{ ...td, color: '#333', fontSize: 11 }}>{i + 1}</td>
                    <td style={{ ...td, fontFamily: 'SF Mono, Fira Code, monospace', fontSize: 11, color: '#9999a8', wordBreak: 'break-all' }}>{entry.path}</td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: entry.exists ? '#34d399' : '#f87171', display: 'inline-block' }} />
                    </td>
                    <td style={td}>
                      {entry.isDuplicate && (
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#2a2010', color: '#fbbf24' }}>duplicate</span>
                      )}
                    </td>
                    <td style={{ ...td, color: '#444', fontSize: 11 }}>
                      {entry.wins.length > 0 ? entry.wins.join(', ') : '—'}
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
