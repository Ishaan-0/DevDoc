import * as fs from 'fs'
import * as nodePath from 'path'
import type { PathEntry, PathScanResult, Issue } from '../types'

const BINARY_NAMES = ['python3', 'python', 'node', 'npm', 'pip3']

export function scanPath(pathVar: string): PathScanResult {
  const dirs = pathVar.split(':').filter(d => d.length > 0)

  const seenRealPaths = new Set<string>()
  // Track which binaries have already been won (first occurrence wins)
  const wonBinaries = new Set<string>()

  const entries: PathEntry[] = []
  const issues: Issue[] = []

  for (const dir of dirs) {
    // Resolve symlink best-effort
    let realPath: string = dir
    try {
      realPath = fs.realpathSync(dir)
    } catch {
      // skip — use original path
    }

    const isDuplicate = seenRealPaths.has(realPath)
    if (!isDuplicate) {
      seenRealPaths.add(realPath)
    }

    const exists = fs.existsSync(dir)

    // Determine which binaries this entry wins
    const wins: string[] = []
    if (!isDuplicate && exists) {
      for (const bin of BINARY_NAMES) {
        if (!wonBinaries.has(bin) && fs.existsSync(nodePath.join(dir, bin))) {
          wins.push(bin)
          wonBinaries.add(bin)
        }
      }
    }

    entries.push({ path: dir, exists, isDuplicate, wins })

    if (isDuplicate) {
      issues.push({ severity: 'warning', message: `Duplicate PATH entry: ${dir}` })
    } else if (!exists) {
      issues.push({ severity: 'warning', message: `Dead PATH entry: ${dir}` })
    }
  }

  return { entries, issues }
}
