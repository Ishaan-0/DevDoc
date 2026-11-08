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
    <div className="p-4">
      <button onClick={onBack} className="mb-4 text-blue-400 hover:text-blue-300">← Back</button>
      <h2 className="text-xl font-semibold mb-4 text-white">Settings</h2>
      <p className="text-gray-400 text-sm mb-4">
        DevDoc walks these folders up to 5 levels deep to find virtual environments and project files.
      </p>
      <ul className="mb-4 space-y-2">
        {roots.map(root => (
          <li key={root} className="flex items-center justify-between bg-gray-900 rounded px-3 py-2">
            <span className="text-sm text-gray-200">{root}</span>
            <button onClick={() => removeFolder(root)} className="text-red-400 text-xs hover:text-red-300">Remove</button>
          </li>
        ))}
        {roots.length === 0 && <li className="text-gray-500 text-sm">No custom roots — using home folder.</li>}
      </ul>
      <div className="flex gap-3">
        <button onClick={addFolder} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded">Add Folder…</button>
        <button onClick={resetToDefault} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded">Reset to Default</button>
      </div>
    </div>
  )
}
