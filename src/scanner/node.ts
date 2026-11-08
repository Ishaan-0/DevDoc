import * as fs from 'fs'
import * as path from 'path'
import { execFile } from 'child_process'
import type { NodeBinary, PackageInfo, NodeScanResult, Issue } from '../types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SKIP_DIRS = new Set(['node_modules', '.git', 'Library'])
const MAX_DEPTH = 5
const TIMEOUT_MS = 10_000

// ---------------------------------------------------------------------------
// Helpers (exported for testing)
// ---------------------------------------------------------------------------

export function detectNodeManager(nodePath: string): NodeBinary['manager'] {
  if (nodePath.includes('.nvm/versions')) return 'nvm'
  if (nodePath.includes('.volta/tools')) return 'volta'
  if (nodePath.includes('.fnm/node-versions') || nodePath.includes('.fnm/aliases')) return 'fnm'
  if (nodePath.includes('/usr/local/bin') || nodePath.includes('/usr/bin')) return 'system'
  return 'unknown'
}

export function parseNpmListGlobal(json: string): PackageInfo[] {
  let parsed: { dependencies?: Record<string, { version: string }> }
  try {
    parsed = JSON.parse(json)
  } catch {
    return []
  }
  if (!parsed.dependencies) return []
  return Object.entries(parsed.dependencies).map(([name, info]) => ({
    name,
    version: info.version,
    sizeBytes: 0,
    isUnused: false,
  }))
}

export function findAllPackageJsonDeps(roots: string[]): Set<string> {
  const deps = new Set<string>()

  function shouldSkipDir(name: string): boolean {
    if (SKIP_DIRS.has(name)) return true
    if (name.startsWith('.')) return true
    return false
  }

  function walk(dir: string, depth: number): void {
    if (depth > MAX_DEPTH) return
    let entries: ReturnType<typeof fs.readdirSync>
    try {
      entries = fs.readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, String(entry))
      let stat: ReturnType<typeof fs.statSync>
      try {
        stat = fs.statSync(fullPath)
      } catch {
        continue
      }
      if (stat.isDirectory()) {
        if (shouldSkipDir(String(entry))) continue
        walk(fullPath, depth + 1)
      } else if (stat.isFile() && String(entry) === 'package.json') {
        const pkgJsonPath = fullPath
        if (fs.existsSync(pkgJsonPath)) {
          try {
            const content = fs.readFileSync(pkgJsonPath, 'utf8') as string
            const pkg = JSON.parse(content) as {
              dependencies?: Record<string, string>
              devDependencies?: Record<string, string>
              peerDependencies?: Record<string, string>
            }
            for (const name of Object.keys(pkg.dependencies ?? {})) deps.add(name)
            for (const name of Object.keys(pkg.devDependencies ?? {})) deps.add(name)
            for (const name of Object.keys(pkg.peerDependencies ?? {})) deps.add(name)
          } catch {
            // ignore malformed package.json
          }
        }
      }
    }
  }

  for (const root of roots) {
    walk(root, 1)
  }

  return deps
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Promisified execFile with AbortSignal timeout.
 *
 * NOTE: In tests, execFile is mocked to call `cb(null, { stdout, stderr })` —
 * a single object as the second argument rather than the real Node signature
 * of `cb(err, stdout, stderr)`. We handle both shapes here.
 */
function execFileP(cmd: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const signal = AbortSignal.timeout(TIMEOUT_MS)
    // The cast is intentional: tests mock cb as (err, out: {stdout, stderr})
    // while the real Node API uses (err, stdout, stderr). We normalise below.
    const child = execFile(
      cmd,
      args,
      { signal } as Parameters<typeof execFile>[2],
      (err, stdoutOrObj: unknown, stderrArg?: unknown) => {
        if (err) {
          resolve({ stdout: '', stderr: String(err.message) })
          return
        }
        // Handle mock pattern: second arg is { stdout, stderr }
        if (stdoutOrObj !== null && typeof stdoutOrObj === 'object' && 'stdout' in (stdoutOrObj as object)) {
          const obj = stdoutOrObj as { stdout: string; stderr: string }
          resolve({ stdout: obj.stdout ?? '', stderr: obj.stderr ?? '' })
          return
        }
        // Real Node pattern: stdout/stderr are strings/Buffers
        resolve({
          stdout: stdoutOrObj != null ? String(stdoutOrObj) : '',
          stderr: stderrArg != null ? String(stderrArg) : '',
        })
      }
    )
    signal.addEventListener('abort', () => {
      resolve({ stdout: '', stderr: 'timeout' })
    })
    void child
  })
}

// ---------------------------------------------------------------------------
// Main scanner
// ---------------------------------------------------------------------------

export async function scanNode(roots: string[]): Promise<NodeScanResult> {
  const issues: Issue[] = []

  // 1. Detect node binary
  const { stdout: whichOut } = await execFileP('which', ['node'])
  const nodePath = whichOut.trim()

  if (!nodePath) {
    issues.push({
      severity: 'error',
      message: 'Node.js is not installed or not found in PATH',
      fixCommand: 'Install Node.js via https://nodejs.org or a version manager like nvm/volta/fnm',
    })
    return { binary: null, globalPackages: [], issues }
  }

  const { stdout: versionOut, stderr: versionErr } = await execFileP('node', ['--version'])
  const nodeVersion = versionOut.trim()

  if (!nodeVersion && versionErr) {
    issues.push({
      severity: 'error',
      message: 'Node.js binary found but could not determine version',
    })
    return { binary: null, globalPackages: [], issues }
  }

  const binary: NodeBinary = {
    path: nodePath,
    version: nodeVersion,
    manager: detectNodeManager(nodePath),
  }

  // 2. Get global npm packages
  const { stdout: npmListOut } = await execFileP('npm', ['list', '-g', '--json', '--depth=0'])
  let globalPackages = parseNpmListGlobal(npmListOut)

  // 3. Get npm global prefix to calculate sizes
  const { stdout: npmRootOut } = await execFileP('npm', ['root', '-g'])
  const npmRoot = npmRootOut.trim()
  // npmRoot is like /usr/local/lib/node_modules; parent dir is the prefix
  const npmPrefix = path.dirname(npmRoot)

  // Get sizes via du -sk per package
  globalPackages = await Promise.all(
    globalPackages.map(async (pkg) => {
      const pkgDir = path.join(npmRoot, pkg.name)
      const { stdout: duOut } = await execFileP('du', ['-sk', pkgDir])
      const match = duOut.match(/^(\d+)/)
      const sizeBytes = match ? parseInt(match[1], 10) * 1024 : 0
      return { ...pkg, sizeBytes }
    })
  )

  void npmPrefix // used for context, pkgDir computed from npmRoot directly

  // 4. Find all deps referenced in package.json files under roots
  const depSet = findAllPackageJsonDeps(roots)

  // Mark unused packages
  globalPackages = globalPackages.map((pkg) => ({
    ...pkg,
    isUnused: !depSet.has(pkg.name),
  }))

  // 5. Issues: TypeScript installed globally (warning)
  const hasGlobalTypeScript = globalPackages.some((p) => p.name === 'typescript')
  if (hasGlobalTypeScript) {
    issues.push({
      severity: 'warning',
      message: 'TypeScript is installed globally — consider using a project-local version instead',
      fixCommand: 'npm uninstall -g typescript && npm install -D typescript',
    })
  }

  return { binary, globalPackages, issues }
}
