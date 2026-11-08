import React, { useState } from 'react'
import { useHistory } from '../hooks/useHistory'
import { diffScans } from '../../src/diff/index'

export function HistoryPanel({ onBack }: { onBack: () => void }) {
  const { history, isLoading } = useHistory()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  if (isLoading) {
    return <div style={{ color: '#444', fontSize: 13 }}>Loading…</div>
  }

  if (history.length === 0) {
    return <p style={{ color: '#444', fontSize: 13 }}>No scan history yet.</p>
  }

  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 28px', letterSpacing: '-0.02em' }}>History</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sorted.map((entry, index) => {
          const prevEntry = sorted[index + 1]
          const diff = prevEntry ? diffScans(prevEntry.result, entry.result) : null
          const summaryLine = !prevEntry
            ? 'First scan'
            : diff && diff.summary.length > 0
              ? diff.summary.join(', ')
              : 'No changes'
          const isExpanded = expandedId === entry.id

          return (
            <div key={entry.id} style={{ background: '#111113', border: '1px solid #1a1a1d', borderRadius: 7, overflow: 'hidden' }}>
              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '11px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <span style={{ fontSize: 12, color: '#ccc' }}>{new Date(entry.timestamp).toLocaleString()}</span>
                <span style={{ fontSize: 11, color: '#444' }}>{summaryLine}</span>
              </button>
              {isExpanded && (
                <div style={{ padding: '0 14px 12px', borderTop: '1px solid #1a1a1d', paddingTop: 10 }}>
                  {!diff ? (
                    <p style={{ fontSize: 11, color: '#444', margin: 0 }}>First scan — no previous data to compare.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {diff.pythonVersionsAdded.map((v, i) => <DiffLine key={i} text={`Python ${v} added`} type="add" />)}
                      {diff.pythonVersionsRemoved.map((v, i) => <DiffLine key={i} text={`Python ${v} removed`} type="remove" />)}
                      {diff.venvsAdded.map((v, i) => <DiffLine key={i} text={`Venv added: ${v}`} type="add" />)}
                      {diff.venvsRemoved.map((v, i) => <DiffLine key={i} text={`Venv removed: ${v}`} type="remove" />)}
                      {diff.nodeVersionChanged && <DiffLine text={`Node: ${diff.nodeVersionChanged}`} type="change" />}
                      {diff.globalPackagesAdded.map((n, i) => <DiffLine key={i} text={`${n} installed globally`} type="add" />)}
                      {diff.globalPackagesRemoved.map((n, i) => <DiffLine key={i} text={`${n} removed globally`} type="remove" />)}
                      {diff.summary.length === 0 && <p style={{ fontSize: 11, color: '#444', margin: 0 }}>No changes detected.</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DiffLine({ text, type }: { text: string; type: 'add' | 'remove' | 'change' }) {
  const color = type === 'add' ? '#34d399' : type === 'remove' ? '#f87171' : '#fbbf24'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color, flexShrink: 0 }}>{type === 'add' ? '+' : type === 'remove' ? '−' : '~'}</span>
      <span style={{ fontSize: 11, color: '#888' }} className="selectable">{text}</span>
    </div>
  )
}
