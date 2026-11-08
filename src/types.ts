export interface Issue {
  severity: 'warning' | 'error'
  message: string
  fixCommand?: string
}

export interface PackageInfo {
  name: string
  version: string
  sizeBytes: number
  isUnused?: boolean
}

export interface VenvInfo {
  path: string
  homePath: string
  pythonVersion: string
  isNested: boolean
  isBroken: boolean
  isOrphaned: boolean
  lastModified: number
  sizeBytes: number
  packages: PackageInfo[]
}

export interface PythonBinary {
  path: string
  version: string
  source: 'homebrew' | 'python.org' | 'pyenv' | 'system' | 'unknown'
}

export interface PathEntry {
  path: string
  exists: boolean
  isDuplicate: boolean
  wins: string[]
}

export interface PythonScanResult {
  binaries: PythonBinary[]
  venvs: VenvInfo[]
  issues: Issue[]
}

export interface NodeBinary {
  path: string
  version: string
  manager: 'nvm' | 'volta' | 'fnm' | 'system' | 'unknown'
}

export interface NodeScanResult {
  binary: NodeBinary | null
  globalPackages: PackageInfo[]
  issues: Issue[]
}

export interface PathScanResult {
  entries: PathEntry[]
  issues: Issue[]
}

export interface StorageScanResult {
  brokenVenvs: VenvInfo[]
  nestedVenvs: VenvInfo[]
  orphanedVenvs: VenvInfo[]
  unusedGlobalPackages: PackageInfo[]
  largestItems: { path: string; sizeBytes: number; label: string }[]
}

export interface ScanResult {
  timestamp: number
  python: PythonScanResult
  node: NodeScanResult
  path: PathScanResult
  storage: StorageScanResult
}

export interface ScanDiff {
  summary: string[]
  pythonVersionsAdded: string[]
  pythonVersionsRemoved: string[]
  venvsAdded: string[]
  venvsRemoved: string[]
  nodeVersionChanged: string | null
  globalPackagesAdded: string[]
  globalPackagesRemoved: string[]
}
