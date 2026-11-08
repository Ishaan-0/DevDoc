import { describe, test, expect } from 'vitest'
import { diffScans } from '../../src/diff/index'
import type { ScanResult } from '../../src/types'

function makeScanResult(overrides?: {
  pythonBinaries?: string[]
  venvPaths?: string[]
  nodeVersion?: string | null
  globalPackageNames?: string[]
}): ScanResult {
  const pythonBinaries = overrides?.pythonBinaries ?? ['3.11']
  const venvPaths = overrides?.venvPaths ?? []
  const nodeVersion = overrides?.nodeVersion ?? 'v20.0.0'
  const globalPackageNames = overrides?.globalPackageNames ?? []
  return {
    timestamp: Date.now(),
    python: {
      binaries: pythonBinaries.map(v => ({ path: `/usr/bin/python${v}`, version: v, source: 'system' as const })),
      venvs: venvPaths.map(p => ({
        path: p, homePath: '/usr/bin', pythonVersion: '3.11',
        isNested: false, isBroken: false, isOrphaned: false,
        lastModified: 0, sizeBytes: 0, packages: [],
      })),
      issues: [],
    },
    node: {
      binary: nodeVersion ? { path: '/usr/local/bin/node', version: nodeVersion, manager: 'system' as const } : null,
      globalPackages: globalPackageNames.map(n => ({ name: n, version: '1.0.0', sizeBytes: 0, isUnused: false })),
      issues: [],
    },
    path: { entries: [], issues: [] },
    storage: { brokenVenvs: [], nestedVenvs: [], orphanedVenvs: [], unusedGlobalPackages: [], largestItems: [] },
  }
}

test('diffScans detects added Python version', () => {
  const a = makeScanResult({ pythonBinaries: ['3.11'] })
  const b = makeScanResult({ pythonBinaries: ['3.11', '3.14'] })
  const diff = diffScans(a, b)
  expect(diff.pythonVersionsAdded).toContain('3.14')
  expect(diff.summary.some(s => /Python.*added/i.test(s))).toBe(true)
})

test('diffScans detects removed venv', () => {
  const a = makeScanResult({ venvPaths: ['/projects/foo/.venv'] })
  const b = makeScanResult({ venvPaths: [] })
  const diff = diffScans(a, b)
  expect(diff.venvsRemoved).toContain('/projects/foo/.venv')
})

test('diffScans returns empty diff for identical scans', () => {
  const a = makeScanResult()
  const diff = diffScans(a, a)
  expect(diff.summary).toHaveLength(0)
})

test('diffScans detects node version change', () => {
  const a = makeScanResult({ nodeVersion: 'v20.0.0' })
  const b = makeScanResult({ nodeVersion: 'v22.0.0' })
  const diff = diffScans(a, b)
  expect(diff.nodeVersionChanged).toBeTruthy()
  expect(diff.summary.some(s => /Node/i.test(s))).toBe(true)
})

test('diffScans detects added global package', () => {
  const a = makeScanResult({ globalPackageNames: ['typescript'] })
  const b = makeScanResult({ globalPackageNames: ['typescript', 'nodemon'] })
  const diff = diffScans(a, b)
  expect(diff.globalPackagesAdded).toContain('nodemon')
})
