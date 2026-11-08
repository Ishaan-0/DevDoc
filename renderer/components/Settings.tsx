import React, { useState, useEffect } from 'react'

export function Settings({ onBack }: { onBack: () => void }) {
  const [roots, setRoots] = useState<string[]>([])

  useEffect(() => {
    window.devdoc.getScanRoots().then(setRoots)
  }, [])

  const addFolder = async () => {
    const picked = await window.devdoc.showFolderPicker()
    if (picked) {
      const updated = [...roots, picked]
      setRoots(updated)
      await window.devdoc.setScanRoots(updated)
    }
  }

  const removeFolder = async (path: string) => {
    const updated = roots.filter(r => r !== path)
    setRoots(updated)
    await window.devdoc.setScanRoots(updated)
  }

  const resetToDefault = async () => {
    setRoots([])
    await window.devdoc.setScanRoots([])
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 28px', letterSpacing: '-0.02em' }}>Settings</h2>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#444', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Scan Folders</div>
        <p style={{ fontSize: 12, color: '#555', marginBottom: 14, lineHeight: 1.5 }}>
          DevDoc walks these folders up to 5 levels deep to find virtual environments and project files.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          {roots.length === 0 ? (
            <p style={{ fontSize: 12, color: '#333' }}>No custom roots — scanning home folder.</p>
          ) : (
            roots.map(root => (
              <div key={root} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111113', border: '1px solid #1a1a1d', borderRadius: 7, padding: '9px 14px' }}>
                <span style={{ fontSize: 12, color: '#ccc', fontFamily: 'SF Mono, Fira Code, monospace' }} className="selectable">{root}</span>
                <button
                  onClick={() => removeFolder(root)}
                  style={{ fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontFamily: 'inherit' }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={addFolder}
            style={{ fontSize: 12, padding: '7px 14px', borderRadius: 6, border: '1px solid #2e2e44', background: '#1a1a2e', color: '#a5b4fc', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Add folder…
          </button>
          <button
            onClick={resetToDefault}
            style={{ fontSize: 12, padding: '7px 14px', borderRadius: 6, border: '1px solid #222', background: '#111113', color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Reset to default
          </button>
        </div>
      </div>
    </div>
  )
}
