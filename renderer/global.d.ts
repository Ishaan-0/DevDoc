import type { ScanResult, ScanDiff } from '../src/types'
declare global {
  interface Window {
    devdoc: {
      runScan(): Promise<ScanResult>
      getLatestScan(): Promise<ScanResult | null>
      getHistory(): Promise<{ id: number; timestamp: number; result: ScanResult }[]>
      getScanRoots(): Promise<string[]>
      setScanRoots(roots: string[]): Promise<void>
      isFirstLaunch(): Promise<boolean>
      markLaunched(): Promise<void>
      diffScans(a: ScanResult, b: ScanResult): Promise<ScanDiff>
      showFolderPicker(): Promise<string | null>
    }
  }
}
