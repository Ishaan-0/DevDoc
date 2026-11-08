import type { ScanResult, ScanDiff } from '../types'

export function diffScans(a: ScanResult, b: ScanResult): ScanDiff {
  const aVersions = new Set(a.python.binaries.map(bin => bin.version))
  const bVersions = new Set(b.python.binaries.map(bin => bin.version))
  const pythonVersionsAdded = [...bVersions].filter(v => !aVersions.has(v))
  const pythonVersionsRemoved = [...aVersions].filter(v => !bVersions.has(v))

  const aVenvs = new Set(a.python.venvs.map(venv => venv.path))
  const bVenvs = new Set(b.python.venvs.map(venv => venv.path))
  const venvsAdded = [...bVenvs].filter(p => !aVenvs.has(p))
  const venvsRemoved = [...aVenvs].filter(p => !bVenvs.has(p))

  const aNodeVersion = a.node.binary?.version ?? null
  const bNodeVersion = b.node.binary?.version ?? null
  const nodeVersionChanged =
    aNodeVersion !== bNodeVersion ? `${aNodeVersion} → ${bNodeVersion}` : null

  const aPackages = new Set(a.node.globalPackages.map(pkg => pkg.name))
  const bPackages = new Set(b.node.globalPackages.map(pkg => pkg.name))
  const globalPackagesAdded = [...bPackages].filter(n => !aPackages.has(n))
  const globalPackagesRemoved = [...aPackages].filter(n => !bPackages.has(n))

  const summary: string[] = []
  for (const v of pythonVersionsAdded) summary.push(`Python ${v} added`)
  for (const v of pythonVersionsRemoved) summary.push(`Python ${v} removed`)
  for (const p of venvsAdded) summary.push(`Venv ${p} added`)
  for (const p of venvsRemoved) summary.push(`Venv ${p} removed`)
  if (nodeVersionChanged) summary.push(`Node changed: ${nodeVersionChanged}`)
  for (const n of globalPackagesAdded) summary.push(`Package ${n} added`)
  for (const n of globalPackagesRemoved) summary.push(`Package ${n} removed`)

  return {
    summary,
    pythonVersionsAdded,
    pythonVersionsRemoved,
    venvsAdded,
    venvsRemoved,
    nodeVersionChanged,
    globalPackagesAdded,
    globalPackagesRemoved,
  }
}
