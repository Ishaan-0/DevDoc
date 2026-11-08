import { useState, useEffect } from 'react'
import type { ScanResult } from '../../src/types'

interface HistoryEntry {
  id: number
  timestamp: number
  result: ScanResult
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.devdoc.getHistory().then(h => {
      setHistory(h)
      setIsLoading(false)
    })
  }, [])

  return { history, isLoading }
}
