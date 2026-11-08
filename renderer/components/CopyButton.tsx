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
      className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
