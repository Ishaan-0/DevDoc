import React, { useState } from 'react'

interface CopyButtonProps { command: string }

export function CopyButton({ command }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        fontSize: 11,
        padding: '3px 10px',
        borderRadius: 5,
        border: '1px solid #2a2a2e',
        background: copied ? '#1a2a1a' : '#1a1a1d',
        color: copied ? '#34d399' : '#888',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
