import { scanPython } from './python'
import { scanNode } from './node'
import { scanPath } from './path'
import { buildStorageSummary } from './storage'
import type { ScanResult } from '../types'

let _scanInProgress: Promise<ScanResult> | null = null

export function runFullScan(roots: string[]): Promise<ScanResult> {
  if (_scanInProgress) return _scanInProgress
  _scanInProgress = (async () => {
    const [python, node] = await Promise.all([scanPython(roots), scanNode(roots)])
    const path = await scanPath(process.env.PATH ?? '')
    const storage = buildStorageSummary(python, node)
    return { timestamp: Date.now(), python, node, path, storage }
  })().finally(() => { _scanInProgress = null })
  return _scanInProgress
}
