import { contextBridge, ipcRenderer } from 'electron'
import type { ScanResult, ScanDiff } from '../src/types'

contextBridge.exposeInMainWorld('devdoc', {
  runScan: (): Promise<ScanResult> => ipcRenderer.invoke('devdoc:runScan'),
  getLatestScan: (): Promise<ScanResult | null> => ipcRenderer.invoke('devdoc:getLatestScan'),
  getHistory: (): Promise<{ id: number; timestamp: number; result: ScanResult }[]> => ipcRenderer.invoke('devdoc:getHistory'),
  getScanRoots: (): Promise<string[]> => ipcRenderer.invoke('devdoc:getScanRoots'),
  setScanRoots: (roots: string[]): Promise<void> => ipcRenderer.invoke('devdoc:setScanRoots', roots),
  isFirstLaunch: (): Promise<boolean> => ipcRenderer.invoke('devdoc:isFirstLaunch'),
  markLaunched: (): Promise<void> => ipcRenderer.invoke('devdoc:markLaunched'),
  diffScans: (a: ScanResult, b: ScanResult): ScanDiff => ipcRenderer.invoke('devdoc:diffScans', a, b),
})
