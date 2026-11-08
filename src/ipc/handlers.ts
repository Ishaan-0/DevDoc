import { ipcMain, dialog } from 'electron'
import { runFullScan } from '../scanner/index'
import { saveScan, getLatestScan, getAllScans } from '../db/scans'
import { getScanRoots, setScanRoots, isFirstLaunch, markLaunched } from '../db/meta'
import { diffScans } from '../diff/index'

export function registerIpcHandlers(): void {
  ipcMain.handle('devdoc:runScan', async () => {
    const roots = getScanRoots()
    const result = await runFullScan(roots)
    saveScan(result)
    return result
  })
  ipcMain.handle('devdoc:getLatestScan', () => getLatestScan())
  ipcMain.handle('devdoc:getHistory', () => getAllScans())
  ipcMain.handle('devdoc:getScanRoots', () => getScanRoots())
  ipcMain.handle('devdoc:setScanRoots', (_event, roots: string[]) => setScanRoots(roots))
  ipcMain.handle('devdoc:isFirstLaunch', () => isFirstLaunch())
  ipcMain.handle('devdoc:markLaunched', () => markLaunched())
  ipcMain.handle('devdoc:diffScans', (_event, a, b) => diffScans(a, b))
  ipcMain.handle('devdoc:showFolderPicker', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return result.canceled ? null : result.filePaths[0]
  })
}
