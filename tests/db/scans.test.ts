import { describe, test, expect, beforeEach } from 'vitest'
import os from 'os'
import { initDb } from '../../src/db/index'
import { saveScan, getLatestScan, getAllScans } from '../../src/db/scans'
import { getScanRoots, setScanRoots, isFirstLaunch, markLaunched } from '../../src/db/meta'
import type { ScanResult } from '../../src/types'

function makeMockScanResult(seed = 0): ScanResult {
  return {
    timestamp: 1000000 + seed,
    python: { binaries: [], venvs: [], issues: [] },
    node: { binary: null, globalPackages: [], issues: [] },
    path: { entries: [], issues: [] },
    storage: {
      brokenVenvs: [],
      nestedVenvs: [],
      orphanedVenvs: [],
      unusedGlobalPackages: [],
      largestItems: []
    }
  }
}

beforeEach(() => {
  initDb(':memory:')
})

describe('scans', () => {
  test('saveScan stores a result and getLatestScan returns it', () => {
    const result = makeMockScanResult()
    saveScan(result)
    const loaded = getLatestScan()
    expect(loaded?.timestamp).toBe(result.timestamp)
    expect(loaded?.python.binaries).toHaveLength(result.python.binaries.length)
  })

  test('getLatestScan returns null when no scans exist', () => {
    expect(getLatestScan()).toBeNull()
  })

  test('prunes oldest scan when count exceeds 50', () => {
    for (let i = 0; i < 51; i++) saveScan(makeMockScanResult(i))
    expect(getAllScans()).toHaveLength(50)
  })

  test('getAllScans returns most recent first', () => {
    saveScan(makeMockScanResult(1))
    saveScan(makeMockScanResult(100))
    const scans = getAllScans()
    expect(scans[0].result.timestamp).toBe(1000100)
  })
})

describe('meta', () => {
  test('isFirstLaunch returns true before markLaunched', () => {
    expect(isFirstLaunch()).toBe(true)
  })

  test('isFirstLaunch returns false after markLaunched', () => {
    markLaunched()
    expect(isFirstLaunch()).toBe(false)
  })

  test('getScanRoots returns homedir when unset', () => {
    expect(getScanRoots()).toEqual([os.homedir()])
  })

  test('setScanRoots persists custom roots', () => {
    setScanRoots(['/Users/test/code'])
    expect(getScanRoots()).toEqual(['/Users/test/code'])
  })
})
