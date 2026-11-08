import * as nodePath from 'path'
import type { StorageScanResult, PythonScanResult, NodeScanResult } from '../types'

export function buildStorageSummary(
  python: PythonScanResult,
  node: NodeScanResult
): StorageScanResult {
  const brokenVenvs = python.venvs.filter(v => v.isBroken)
  const nestedVenvs = python.venvs.filter(v => v.isNested)
  const orphanedVenvs = python.venvs.filter(v => v.isOrphaned)
  const unusedGlobalPackages = node.globalPackages.filter(p => p.isUnused)

  // Combine venvs and global packages into a unified list for largestItems
  const venvItems = python.venvs.map(v => ({
    path: v.path,
    sizeBytes: v.sizeBytes,
    label: nodePath.basename(v.path),
  }))

  const packageItems = node.globalPackages.map(p => ({
    path: p.name,
    sizeBytes: p.sizeBytes,
    label: p.name,
  }))

  const largestItems = [...venvItems, ...packageItems]
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .slice(0, 20)

  return {
    brokenVenvs,
    nestedVenvs,
    orphanedVenvs,
    unusedGlobalPackages,
    largestItems,
  }
}
