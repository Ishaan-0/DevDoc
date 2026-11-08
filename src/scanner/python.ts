import * as fs from 'fs'
import * as path from 'path'
import { execFile } from 'child_process'
import type { VenvInfo, PythonBinary, PythonScanResult, Issue } from '../types'

// ---------------------------------------------------------------------------
// Helpers (exported for testing)
// ---------------------------------------------------------------------------

export function parsePyvenvCfg(content: string): { home: string; version: string } {
  let home = ''
  let version = ''
  for (const line of content.split('\n')) {
    const homeMatch = line.match(/^home\s*=\s*(.+)$/)
    if (homeMatch) home = homeMatch[1].trim()
    const versionMatch = line.match(/^version\s*=\s*(.+)$/)
    if (versionMatch) version = versionMatch[1].trim()
  }
  return { home, version }
}

export function detectBinarySource(binPath: string): PythonBinary['source'] {
  if (binPath.includes('/opt/homebrew') || binPath.includes('/usr/local/Cellar')) {
    return 'homebrew'
  }
  if (binPath.includes('.pyenv/shims') || binPath.includes('.pyenv/versions')) {
    return 'pyenv'
  }
  if (binPath.includes('/Library/Frameworks/Python.framework')) {
    return 'python.org'
  }
  if (binPath.startsWith('/usr/bin') || binPath.startsWith('/usr/local/bin')) {
    return 'system'
  }
  return 'unknown'
}

/**
 * Returns true if `venvPath` is physically nested inside one of the other
 * known venv paths (i.e. it is a sub-venv of another venv).
 */
export function isNestedVenv(venvPath: string, allVenvPaths: string[]): boolean {
  for (const other of allVenvPaths) {
    if (other === venvPath) continue
    // venvPath starts with other + path separator → it lives inside `other`
    if (venvPath.startsWith(other + path.sep) || venvPath.startsWith(other + '/')) {
      return true
    }
  }
  return false
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const SKIP_DIR_NAMES = new Set(['node_modules', '.git'])
const MAX_DEPTH = 5
const TIMEOUT_MS = 10_000

function shouldSkipDir(name: string, fullPath: string): boolean {
  if (SKIP_DIR_NAMES.has(name)) return true
  if (fullPath.startsWith('/Library')) return true
  if (name.startsWith('.') && name !== '.venv') return true
  return false
}

/** Promisified execFile with AbortSignal timeout. */
function execFileP(cmd: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const signal = AbortSignal.timeout(TIMEOUT_MS)
    const child = execFile(cmd, args, { signal } as any, (err, stdout, stderr) => {
      if (err) {
        resolve({ stdout: '', stderr: String(err.message) })
        return
      }
      resolve({ stdout: stdout.toString(), stderr: stderr.toString() })
    })
    // If AbortSignal fires before callback, resolve with timeout error
    signal.addEventListener('abort', () => {
      resolve({ stdout: '', stderr: 'timeout' })
    })
    void child
  })
}

/** Walk directory tree up to maxDepth, collecting all pyvenv.cfg file paths. */
function findPyvenvCfgs(rootDir: string): string[] {
  const results: string[] = []

  function walk(dir: string, depth: number): void {
    if (depth > MAX_DEPTH) return
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true }) as fs.Dirent[]
    } catch {
      return
    }
    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isFile()) continue
      const fullPath = path.join(dir, entry.name)
      if (entry.isFile() && entry.name === 'pyvenv.cfg') {
        results.push(fullPath)
      } else if (entry.isDirectory()) {
        if (shouldSkipDir(entry.name, fullPath)) continue
        walk(fullPath, depth + 1)
      }
    }
  }

  walk(rootDir, 1)
  return results
}

/** Get size in bytes of a venv using `du -sk`. */
async function getVenvSize(venvPath: string): Promise<number> {
  const { stdout } = await execFileP('du', ['-sk', venvPath])
  const match = stdout.match(/^(\d+)/)
  if (!match) return 0
  return parseInt(match[1], 10) * 1024
}

/** Get last modified time of a venv. */
function getLastModified(venvPath: string): number {
  try {
    const libPath = path.join(venvPath, 'lib')
    return fs.statSync(libPath).mtimeMs
  } catch {
    try {
      return fs.statSync(venvPath).mtimeMs
    } catch {
      return 0
    }
  }
}

/** Check if venv is orphaned (no pyproject.toml/requirements.txt/setup.py in parent). */
function checkOrphaned(venvPath: string): boolean {
  const parentDir = path.dirname(venvPath)
  const markers = ['pyproject.toml', 'requirements.txt', 'setup.py']
  for (const marker of markers) {
    if (fs.existsSync(path.join(parentDir, marker))) {
      return false
    }
  }
  return true
}

/** Discover Python binaries on the system. */
async function discoverBinaries(): Promise<PythonBinary[]> {
  const binaries: PythonBinary[] = []
  const seen = new Set<string>()

  // Get all python3 and python paths (BSD which on macOS accepts only one name at a time)
  const [{ stdout: which3Out }, { stdout: which2Out }] = await Promise.all([
    execFileP('which', ['-a', 'python3']),
    execFileP('which', ['-a', 'python']),
  ])
  const paths = [...which3Out.split('\n'), ...which2Out.split('\n')]
    .map(l => l.trim())
    .filter(Boolean)

  for (const binPath of paths) {
    if (seen.has(binPath)) continue
    seen.add(binPath)

    const { stdout: versionOut, stderr: versionErr } = await execFileP(binPath, ['--version'])
    const versionMatch = (versionOut || versionErr).match(/Python\s+([\d.]+)/)
    const version = versionMatch ? versionMatch[1] : 'unknown'

    binaries.push({
      path: binPath,
      version,
      source: detectBinarySource(binPath),
    })
  }

  return binaries
}

// ---------------------------------------------------------------------------
// Main scanner
// ---------------------------------------------------------------------------

export async function scanPython(roots: string[]): Promise<PythonScanResult> {
  const issues: Issue[] = []

  // 1. Discover binaries
  const binaries = await discoverBinaries()

  // 2. Walk roots to find all pyvenv.cfg files
  const cfgPaths: string[] = []
  for (const root of roots) {
    cfgPaths.push(...findPyvenvCfgs(root))
  }

  // venv paths = parent directory of each pyvenv.cfg
  const venvPaths = cfgPaths.map(p => path.dirname(p))

  // 3. Build VenvInfo for each venv
  const venvs: VenvInfo[] = []

  for (const cfgPath of cfgPaths) {
    const venvPath = path.dirname(cfgPath)

    let cfgContent: string
    try {
      cfgContent = fs.readFileSync(cfgPath, 'utf8') as string
    } catch {
      continue
    }

    const { home, version } = parsePyvenvCfg(cfgContent)
    const isBroken = !fs.existsSync(home)
    const isNested = isNestedVenv(venvPath, venvPaths)
    const isOrphaned = checkOrphaned(venvPath)
    const lastModified = getLastModified(venvPath)
    const sizeBytes = await getVenvSize(venvPath)

    if (isBroken) {
      issues.push({
        severity: 'error',
        message: `Broken venv at ${venvPath}: interpreter home '${home}' no longer exists`,
        fixCommand: `rm -rf "${venvPath}"`,
      })
    }

    if (isNested) {
      issues.push({
        severity: 'warning',
        message: `Nested venv detected at ${venvPath}`,
      })
    }

    venvs.push({
      path: venvPath,
      homePath: home,
      pythonVersion: version,
      isNested,
      isBroken,
      isOrphaned,
      lastModified,
      sizeBytes,
      packages: [],
    })
  }

  // 4. Check for conflicting Python versions across binaries
  const versions = new Set(binaries.map(b => b.version).filter(v => v !== 'unknown'))
  if (versions.size > 1) {
    issues.push({
      severity: 'warning',
      message: `Multiple Python versions detected: ${[...versions].join(', ')}`,
    })
  }

  return { binaries, venvs, issues }
}
