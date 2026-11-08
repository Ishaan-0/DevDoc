import { useState, useCallback } from 'react'
import type { ScanResult } from '../../src/types'

export function useScan() {
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const triggerScan = useCallback(async () => {
    setIsScanning(true)
    setError(null)
    try {
      const result = await window.devdoc.runScan()
      setScan(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed')
    } finally {
      setIsScanning(false)
    }
  }, [])

  return { scan, isScanning, error, triggerScan }
}
