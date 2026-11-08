import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock fs at module level before imports
vi.mock('fs', () => {
  return {
    default: {
      readdirSync: vi.fn(),
      readFileSync: vi.fn(),
      existsSync: vi.fn(),
      statSync: vi.fn(),
    },
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
    statSync: vi.fn(),
  }
})

// Mock child_process at module level
vi.mock('child_process', () => {
  return {
    execFile: vi.fn(),
  }
})

// Mock os at module level
vi.mock('os', () => {
  return {
    default: {
      homedir: vi.fn(() => '/Users/test'),
    },
    homedir: vi.fn(() => '/Users/test'),
  }
})

import { parsePyvenvCfg, detectBinarySource, isNestedVenv, scanPython } from '../../src/scanner/python'
import * as fs from 'fs'
import * as childProcess from 'child_process'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('parsePyvenvCfg', () => {
  test('parsePyvenvCfg extracts home and version', () => {
    const cfg = 'home = /opt/homebrew/bin\nversion = 3.12.3\n'
    expect(parsePyvenvCfg(cfg)).toEqual({ home: '/opt/homebrew/bin', version: '3.12.3' })
  })
})

describe('isNestedVenv', () => {
  test('isNestedVenv returns true when home is inside another venv', () => {
    const allVenvs = ['/projects/a/.venv', '/projects/b/.venv']
    // venv at /projects/a/.venv/subenv whose home = /projects/a/.venv/bin
    expect(isNestedVenv('/projects/a/.venv/subenv', allVenvs)).toBe(true)
  })

  test('isNestedVenv returns false for a normal venv', () => {
    const allVenvs = ['/projects/a/.venv', '/projects/b/.venv']
    expect(isNestedVenv('/projects/a/.venv', allVenvs)).toBe(false)
  })
})

describe('detectBinarySource', () => {
  test('detectBinarySource identifies homebrew path', () => {
    expect(detectBinarySource('/opt/homebrew/bin/python3')).toBe('homebrew')
  })

  test('detectBinarySource identifies pyenv shim', () => {
    expect(detectBinarySource('/Users/test/.pyenv/shims/python3')).toBe('pyenv')
  })
})

describe('scanPython integration', () => {
  test('scanPython returns broken venv when home path missing', async () => {
    // Set up fake pyvenv.cfg content where home = /nonexistent/path
    const fakeCfgContent = 'home = /nonexistent/path\nversion = 3.11.0\n'

    // Mock readdirSync to return a fake .venv dir at depth 1
    vi.mocked(fs.readdirSync).mockImplementation((dirPath: any, options?: any) => {
      if (dirPath === '/tmp/fakeroots') {
        return [
          { name: '.venv', isDirectory: () => true, isFile: () => false } as any
        ]
      }
      if (dirPath === '/tmp/fakeroots/.venv') {
        return [
          { name: 'pyvenv.cfg', isDirectory: () => false, isFile: () => true } as any
        ]
      }
      return []
    })

    // pyvenv.cfg exists but home path does not
    vi.mocked(fs.existsSync).mockImplementation((p: any) => {
      if (p === '/tmp/fakeroots/.venv/pyvenv.cfg') return true
      if (p === '/nonexistent/path') return false
      // parent dir project files
      if (p === '/tmp/fakeroots/pyproject.toml') return false
      if (p === '/tmp/fakeroots/requirements.txt') return false
      if (p === '/tmp/fakeroots/setup.py') return false
      return false
    })

    vi.mocked(fs.readFileSync).mockImplementation((p: any, encoding?: any) => {
      if (p === '/tmp/fakeroots/.venv/pyvenv.cfg') return fakeCfgContent
      return ''
    })

    vi.mocked(fs.statSync).mockImplementation((p: any) => {
      return { mtimeMs: 1000000 } as any
    })

    // Mock execFile to simulate timeout / no binaries
    vi.mocked(childProcess.execFile).mockImplementation((...args: any[]) => {
      // call callback with error (simulate no python found)
      const cb = args[args.length - 1]
      if (typeof cb === 'function') {
        cb(new Error('not found'), '', '')
      }
      return {} as any
    })

    const result = await scanPython(['/tmp/fakeroots'])
    const broken = result.venvs.find(v => v.isBroken)
    expect(broken).toBeDefined()
    expect(result.issues.some(i => i.severity === 'error')).toBe(true)
  })
})
