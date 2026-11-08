// @vitest-environment jsdom
import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, test, expect, beforeEach } from 'vitest'
import { Dashboard } from '../../renderer/components/Dashboard'
import { ScanButton } from '../../renderer/components/ScanButton'
import type { ScanResult } from '../../src/types'

function mockScanResult(): ScanResult {
  return {
    timestamp: Date.now(),
    python: { binaries: [], venvs: [], issues: [] },
    node: { binary: null, globalPackages: [], issues: [] },
    path: { entries: [], issues: [] },
    storage: { brokenVenvs: [], nestedVenvs: [], orphanedVenvs: [], unusedGlobalPackages: [], largestItems: [] },
  }
}

function mockScanResultWithIssues(opts: { pythonIssueCount: number }): ScanResult {
  const base = mockScanResult()
  base.python.issues = Array.from({ length: opts.pythonIssueCount }, (_, i) => ({
    severity: 'warning' as const,
    message: `issue ${i}`,
  }))
  return base
}

test('renders all 4 cards', () => {
  render(<Dashboard scan={mockScanResult()} onCardClick={() => {}} />)
  expect(screen.getByText('Python')).toBeInTheDocument()
  expect(screen.getByText('Node')).toBeInTheDocument()
  expect(screen.getByText('Storage')).toBeInTheDocument()
  expect(screen.getByText('PATH')).toBeInTheDocument()
})

test('PythonCard shows issue count when issues present', () => {
  const scan = mockScanResultWithIssues({ pythonIssueCount: 2 })
  render(<Dashboard scan={scan} onCardClick={() => {}} />)
  expect(screen.getByText('2 issues')).toBeInTheDocument()
})

test('FirstLaunchBanner renders when isFirstLaunch is true', () => {
  render(
    <Dashboard
      scan={mockScanResult()}
      isFirstLaunch={true}
      onCardClick={() => {}}
      onDismissBanner={() => {}}
    />
  )
  expect(screen.getByText(/scanning your home folder/i)).toBeInTheDocument()
})

test('ScanButton is disabled while scanning', () => {
  render(<ScanButton isScanning={true} lastScanTime={Date.now()} onScan={() => {}} />)
  expect(screen.getByRole('button')).toBeDisabled()
})
