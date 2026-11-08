import { contextBridge } from 'electron'

// IPC bridge will be populated in Task 6
contextBridge.exposeInMainWorld('devdoc', {})
