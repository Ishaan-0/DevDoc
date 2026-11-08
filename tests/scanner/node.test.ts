import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

// Mock fs and child_process at module level
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
  readFileSync: vi.fn(),
}))

vi.mock('child_process', () => ({
  execFile: vi.fn(),
}))

import * as fs from 'fs'
import * as cp from 'child_process'

import {
  detectNodeManager,
  parseNpmListGlobal,
  findAllPackageJsonDeps,
  scanNode,
} from '../../src/scanner/node'

const mockExecFile = cp.execFile as unknown as Mock
const mockExistsSync = fs.existsSync as unknown as Mock
const mockReaddirSync = fs.readdirSync as unknown as Mock
const mockStatSync = fs.statSync as unknown as Mock
const mockReadFileSync = fs.readFileSync as unknown as Mock

// Helper to make execFile return a value via callback
function execFileReturns(stdout: string, stderr = '') {
  mockExecFile.mockImplementation(
    (_cmd: string, _args: string[], _opts: unknown, cb: (err: null, out: { stdout: string; stderr: string }) => void) => {
      cb(null, { stdout, stderr })
    }
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('detectNodeManager', () => {
  test('identifies nvm', () => {
    expect(detectNodeManager('/Users/test/.nvm/versions/node/v20.0.0/bin/node')).toBe('nvm')
  })

  test('identifies volta', () => {
    expect(detectNodeManager('/Users/test/.volta/tools/image/node/20.0.0/bin/node')).toBe('volta')
  })

  test('identifies fnm', () => {
    expect(detectNodeManager('/Users/test/.fnm/node-versions/v20.0.0/bin/node')).toBe('fnm')
  })

  test('identifies system from /usr/local/bin', () => {
    expect(detectNodeManager('/usr/local/bin/node')).toBe('system')
  })

  test('identifies system from /usr/bin', () => {
    expect(detectNodeManager('/usr/bin/node')).toBe('system')
  })

  test('returns unknown for unrecognized path', () => {
    expect(detectNodeManager('/opt/custom/node')).toBe('unknown')
  })
})

describe('parseNpmListGlobal', () => {
  test('extracts package names and versions', () => {
    const json = JSON.stringify({
      dependencies: {
        typescript: { version: '5.4.0' },
        nodemon: { version: '3.1.0' },
      },
    })
    const result = parseNpmListGlobal(json)
    expect(result).toContainEqual(expect.objectContaining({ name: 'typescript', version: '5.4.0' }))
    expect(result).toContainEqual(expect.objectContaining({ name: 'nodemon', version: '3.1.0' }))
  })

  test('returns empty array for empty dependencies', () => {
    const json = JSON.stringify({ dependencies: {} })
    expect(parseNpmListGlobal(json)).toEqual([])
  })

  test('sets sizeBytes to 0', () => {
    const json = JSON.stringify({ dependencies: { foo: { version: '1.0.0' } } })
    const result = parseNpmListGlobal(json)
    expect(result[0].sizeBytes).toBe(0)
  })

  test('handles missing dependencies key', () => {
    const json = JSON.stringify({})
    expect(parseNpmListGlobal(json)).toEqual([])
  })
})

describe('findAllPackageJsonDeps', () => {
  test('collects deps from multiple package.json files', () => {
    // Simulate: /projects has one subdirectory with a package.json
    mockReaddirSync.mockImplementation((dir: string) => {
      if (dir === '/projects') return ['myapp'] as unknown as ReturnType<typeof fs.readdirSync>
      if (dir === '/projects/myapp') return ['package.json'] as unknown as ReturnType<typeof fs.readdirSync>
      return [] as unknown as ReturnType<typeof fs.readdirSync>
    })
    mockStatSync.mockImplementation((p: string) => ({
      isDirectory: () => !p.endsWith('package.json'),
      isFile: () => p.endsWith('package.json'),
    }))
    mockExistsSync.mockImplementation((p: string) => {
      return p === '/projects/myapp/package.json'
    })
    mockReadFileSync.mockImplementation((p: string) => {
      if (p === '/projects/myapp/package.json') {
        return JSON.stringify({
          dependencies: { react: '^18.0.0' },
          devDependencies: { typescript: '^5.0.0' },
        })
      }
      return '{}'
    })

    const deps = findAllPackageJsonDeps(['/projects'])
    expect(deps.has('react')).toBe(true)
    expect(deps.has('typescript')).toBe(true)
  })

  test('returns empty set when no package.json files found', () => {
    mockReaddirSync.mockReturnValue([] as unknown as ReturnType<typeof fs.readdirSync>)
    mockExistsSync.mockReturnValue(false)
    const deps = findAllPackageJsonDeps(['/empty'])
    expect(deps.size).toBe(0)
  })
})

describe('scanNode', () => {
  test('marks global package as unused when not in any package.json', async () => {
    // Setup fs mocks: /tmp/fakeroots has one project with package.json NOT containing 'some-obscure-tool'
    mockReaddirSync.mockImplementation((dir: string) => {
      if (dir === '/tmp/fakeroots') return ['myproject'] as unknown as ReturnType<typeof fs.readdirSync>
      if (dir === '/tmp/fakeroots/myproject') return ['package.json'] as unknown as ReturnType<typeof fs.readdirSync>
      return [] as unknown as ReturnType<typeof fs.readdirSync>
    })
    mockStatSync.mockImplementation((p: string) => ({
      isDirectory: () => !p.endsWith('package.json'),
      isFile: () => p.endsWith('package.json'),
    }))
    mockExistsSync.mockImplementation((p: string) => {
      return p === '/tmp/fakeroots/myproject/package.json'
    })
    mockReadFileSync.mockImplementation((p: string) => {
      if (p === '/tmp/fakeroots/myproject/package.json') {
        return JSON.stringify({ dependencies: { react: '^18.0.0' } })
      }
      return '{}'
    })

    // execFile mock: different responses for different commands
    mockExecFile.mockImplementation(
      (cmd: string, args: string[], _opts: unknown, cb: (err: Error | null, out?: { stdout: string; stderr: string }) => void) => {
        if (cmd === 'which' && args[0] === 'node') {
          cb(null, { stdout: '/usr/local/bin/node\n', stderr: '' })
        } else if (cmd === 'node' && args[0] === '--version') {
          cb(null, { stdout: 'v20.0.0\n', stderr: '' })
        } else if (cmd === 'npm' && args.includes('list')) {
          cb(null, {
            stdout: JSON.stringify({
              dependencies: {
                'some-obscure-tool': { version: '1.0.0' },
              },
            }),
            stderr: '',
          })
        } else if (cmd === 'npm' && args.includes('root')) {
          cb(null, { stdout: '/usr/local/lib/node_modules\n', stderr: '' })
        } else if (cmd === 'du') {
          cb(null, { stdout: '100\t/usr/local/lib/some-obscure-tool\n', stderr: '' })
        } else {
          cb(null, { stdout: '', stderr: '' })
        }
      }
    )

    const result = await scanNode(['/tmp/fakeroots'])
    const unused = result.globalPackages.find(p => p.name === 'some-obscure-tool')
    expect(unused?.isUnused).toBe(true)
  })

  test('returns null binary when node is not found', async () => {
    mockReaddirSync.mockReturnValue([] as unknown as ReturnType<typeof fs.readdirSync>)
    mockExistsSync.mockReturnValue(false)
    mockReadFileSync.mockReturnValue('{}')

    mockExecFile.mockImplementation(
      (_cmd: string, _args: string[], _opts: unknown, cb: (err: Error | null, out?: { stdout: string; stderr: string }) => void) => {
        cb(new Error('not found'))
      }
    )

    const result = await scanNode(['/tmp/fakeroots'])
    expect(result.binary).toBeNull()
  })
})
