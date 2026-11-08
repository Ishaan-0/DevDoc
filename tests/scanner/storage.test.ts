import { describe, test, expect } from 'vitest'
import type { PythonScanResult, NodeScanResult, VenvInfo, PackageInfo } from '../../src/types'
import { buildStorageSummary } from '../../src/scanner/storage'

// --- Helper factories ---

function makeVenv(overrides: Partial<VenvInfo> = {}): VenvInfo {
  return {
    path: '/projects/.venv',
    homePath: '/opt/homebrew/bin',
    pythonVersion: '3.12.0',
    isNested: false,
    isBroken: false,
    isOrphaned: false,
    lastModified: Date.now(),
    sizeBytes: 1_000_000,
    packages: [],
    ...overrides,
  }
}

function makePackage(overrides: Partial<PackageInfo> = {}): PackageInfo {
  return {
    name: 'some-package',
    version: '1.0.0',
    sizeBytes: 500_000,
    isUnused: false,
    ...overrides,
  }
}

function makeEmptyPythonResult(): PythonScanResult {
  return { binaries: [], venvs: [], issues: [] }
}

function makeEmptyNodeResult(): NodeScanResult {
  return { binary: null, globalPackages: [], issues: [] }
}

function makePythonResultWithBrokenVenv(): PythonScanResult {
  return {
    binaries: [],
    venvs: [makeVenv({ isBroken: true, path: '/projects/broken/.venv' })],
    issues: [],
  }
}

function makeNodeResultWithUnusedPackage(name: string): NodeScanResult {
  return {
    binary: null,
    globalPackages: [makePackage({ name, isUnused: true })],
    issues: [],
  }
}

function makePythonResultWithVenvs(): PythonScanResult {
  return {
    binaries: [],
    venvs: [
      makeVenv({ path: '/projects/a/.venv', sizeBytes: 3_000_000 }),
      makeVenv({ path: '/projects/b/.venv', sizeBytes: 1_000_000 }),
      makeVenv({ path: '/projects/c/.venv', sizeBytes: 5_000_000 }),
    ],
    issues: [],
  }
}

// --- Tests ---

describe('buildStorageSummary', () => {
  test('buildStorageSummary surfaces broken venvs from python scan', () => {
    const python = makePythonResultWithBrokenVenv()
    const node = makeEmptyNodeResult()
    const result = buildStorageSummary(python, node)
    expect(result.brokenVenvs).toHaveLength(1)
  })

  test('buildStorageSummary surfaces nested venvs from python scan', () => {
    const python: PythonScanResult = {
      binaries: [],
      venvs: [makeVenv({ isNested: true, path: '/projects/a/.venv/nested' })],
      issues: [],
    }
    const result = buildStorageSummary(python, makeEmptyNodeResult())
    expect(result.nestedVenvs).toHaveLength(1)
  })

  test('buildStorageSummary surfaces orphaned venvs from python scan', () => {
    const python: PythonScanResult = {
      binaries: [],
      venvs: [makeVenv({ isOrphaned: true, path: '/tmp/orphan/.venv' })],
      issues: [],
    }
    const result = buildStorageSummary(python, makeEmptyNodeResult())
    expect(result.orphanedVenvs).toHaveLength(1)
  })

  test('buildStorageSummary surfaces unused global packages from node scan', () => {
    const python = makeEmptyPythonResult()
    const node = makeNodeResultWithUnusedPackage('old-tool')
    const result = buildStorageSummary(python, node)
    expect(result.unusedGlobalPackages.some(p => p.name === 'old-tool')).toBe(true)
  })

  test('largestItems sorted descending by size', () => {
    const result = buildStorageSummary(makePythonResultWithVenvs(), makeEmptyNodeResult())
    const sizes = result.largestItems.map(i => i.sizeBytes)
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a))
  })

  test('largestItems capped at 20', () => {
    const venvs = Array.from({ length: 25 }, (_, i) =>
      makeVenv({ path: `/projects/v${i}/.venv`, sizeBytes: i * 100_000 })
    )
    const python: PythonScanResult = { binaries: [], venvs, issues: [] }
    const result = buildStorageSummary(python, makeEmptyNodeResult())
    expect(result.largestItems.length).toBeLessThanOrEqual(20)
  })

  test('largestItems label uses basename for venvs', () => {
    const python: PythonScanResult = {
      binaries: [],
      venvs: [makeVenv({ path: '/projects/myapp/.venv', sizeBytes: 2_000_000 })],
      issues: [],
    }
    const result = buildStorageSummary(python, makeEmptyNodeResult())
    const item = result.largestItems.find(i => i.path === '/projects/myapp/.venv')
    expect(item?.label).toBe('.venv')
  })

  test('largestItems label uses package name for global packages', () => {
    const node: NodeScanResult = {
      binary: null,
      globalPackages: [makePackage({ name: 'webpack', sizeBytes: 3_000_000 })],
      issues: [],
    }
    const result = buildStorageSummary(makeEmptyPythonResult(), node)
    const item = result.largestItems.find(i => i.label === 'webpack')
    expect(item).toBeDefined()
  })

  test('empty inputs produce empty results', () => {
    const result = buildStorageSummary(makeEmptyPythonResult(), makeEmptyNodeResult())
    expect(result.brokenVenvs).toHaveLength(0)
    expect(result.nestedVenvs).toHaveLength(0)
    expect(result.orphanedVenvs).toHaveLength(0)
    expect(result.unusedGlobalPackages).toHaveLength(0)
    expect(result.largestItems).toHaveLength(0)
  })
})
