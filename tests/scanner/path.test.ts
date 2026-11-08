import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock fs at module level before imports
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  realpathSync: vi.fn(),
}))

import * as fs from 'fs'
import { scanPath } from '../../src/scanner/path'

const mockExistsSync = fs.existsSync as unknown as ReturnType<typeof vi.fn>
const mockRealpathSync = fs.realpathSync as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  // Default: realpathSync returns the path unchanged (no symlinks)
  mockRealpathSync.mockImplementation((p: string) => p)
  // Default: existsSync returns false
  mockExistsSync.mockReturnValue(false)
})

describe('scanPath', () => {
  test('scanPath marks duplicate entries', () => {
    // /usr/bin appears twice — second occurrence is the duplicate
    mockRealpathSync.mockImplementation((p: string) => p)
    mockExistsSync.mockReturnValue(false)

    const result = scanPath('/usr/bin:/opt/homebrew/bin:/usr/bin')
    const dups = result.entries.filter(e => e.isDuplicate)
    expect(dups).toHaveLength(1)
    expect(dups[0].path).toBe('/usr/bin')
  })

  test('scanPath marks symlink-resolved duplicates', () => {
    // /usr/local/bin is a symlink to /opt/homebrew/bin on some setups
    mockRealpathSync.mockImplementation((p: string) => {
      if (p === '/opt/homebrew/bin') return '/opt/homebrew/bin'
      if (p === '/usr/local/bin') return '/opt/homebrew/bin'
      return p
    })
    mockExistsSync.mockReturnValue(false)

    const result = scanPath('/opt/homebrew/bin:/usr/local/bin')
    const dups = result.entries.filter(e => e.isDuplicate)
    expect(dups).toHaveLength(1)
  })

  test('scanPath marks non-existent directories', () => {
    mockRealpathSync.mockImplementation((p: string) => p)
    mockExistsSync.mockImplementation((p: string) => {
      return p === '/usr/bin'
    })

    const result = scanPath('/usr/bin:/this/does/not/exist')
    const dead = result.entries.find(e => e.path === '/this/does/not/exist')
    expect(dead?.exists).toBe(false)
  })

  test('scanPath reports which entry wins for python3', () => {
    // /opt/homebrew/bin exists and contains python3; /usr/bin exists but has no python3
    mockRealpathSync.mockImplementation((p: string) => p)
    mockExistsSync.mockImplementation((p: string) => {
      return p === '/opt/homebrew/bin' || p === '/opt/homebrew/bin/python3' || p === '/usr/bin'
    })

    const result = scanPath('/opt/homebrew/bin:/usr/bin')
    const winner = result.entries.find(e => e.wins.includes('python3'))
    expect(winner?.path).toBe('/opt/homebrew/bin')
  })

  test('scanPath emits warning issue for each duplicate', () => {
    mockRealpathSync.mockImplementation((p: string) => p)
    mockExistsSync.mockReturnValue(false)

    const result = scanPath('/usr/bin:/opt/homebrew/bin:/usr/bin')
    const dupIssues = result.issues.filter(i => i.message.includes('Duplicate PATH entry'))
    expect(dupIssues).toHaveLength(1)
    expect(dupIssues[0].severity).toBe('warning')
  })

  test('scanPath emits warning issue for each dead entry', () => {
    mockRealpathSync.mockImplementation((p: string) => p)
    mockExistsSync.mockReturnValue(false)

    const result = scanPath('/this/does/not/exist')
    const deadIssues = result.issues.filter(i => i.message.includes('Dead PATH entry'))
    expect(deadIssues).toHaveLength(1)
    expect(deadIssues[0].severity).toBe('warning')
  })

  test('scanPath first entry for a binary is not a duplicate', () => {
    mockRealpathSync.mockImplementation((p: string) => p)
    mockExistsSync.mockReturnValue(false)

    const result = scanPath('/usr/bin:/opt/homebrew/bin:/usr/bin')
    const first = result.entries.find(e => e.path === '/usr/bin' && !e.isDuplicate)
    expect(first).toBeDefined()
  })
})
