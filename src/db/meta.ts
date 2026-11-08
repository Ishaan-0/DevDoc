import os from 'os'
import { getDb } from './index'

export function getScanRoots(): string[] {
  const db = getDb()
  const row = db.prepare<[], { value: string }>(
    "SELECT value FROM meta WHERE key = 'scanRoots'"
  ).get()
  if (!row) return [os.homedir()]
  return JSON.parse(row.value) as string[]
}

export function setScanRoots(roots: string[]): void {
  const db = getDb()
  db.prepare(
    "INSERT OR REPLACE INTO meta (key, value) VALUES ('scanRoots', ?)"
  ).run(JSON.stringify(roots))
}

export function isFirstLaunch(): boolean {
  const db = getDb()
  const row = db.prepare<[], { value: string }>(
    "SELECT value FROM meta WHERE key = 'launched'"
  ).get()
  return !row
}

export function markLaunched(): void {
  const db = getDb()
  db.prepare(
    "INSERT OR REPLACE INTO meta (key, value) VALUES ('launched', '1')"
  ).run()
}
