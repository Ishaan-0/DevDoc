import { getDb } from './index'
import type { ScanResult } from '../types'

const SCAN_CAP = 50

export function saveScan(result: ScanResult): void {
  const db = getDb()
  db.prepare(
    'INSERT INTO scans (timestamp, json_snapshot) VALUES (?, ?)'
  ).run(result.timestamp, JSON.stringify(result))

  // Prune oldest beyond cap
  db.prepare(`
    DELETE FROM scans
    WHERE id NOT IN (
      SELECT id FROM scans ORDER BY timestamp DESC LIMIT ${SCAN_CAP}
    )
  `).run()
}

export function getLatestScan(): ScanResult | null {
  const db = getDb()
  const row = db.prepare<[], { json_snapshot: string }>(
    'SELECT json_snapshot FROM scans ORDER BY timestamp DESC LIMIT 1'
  ).get()
  if (!row) return null
  return JSON.parse(row.json_snapshot) as ScanResult
}

export function getAllScans(): { id: number; timestamp: number; result: ScanResult }[] {
  const db = getDb()
  const rows = db.prepare<[], { id: number; timestamp: number; json_snapshot: string }>(
    'SELECT id, timestamp, json_snapshot FROM scans ORDER BY timestamp DESC'
  ).all()
  return rows.map(r => ({ id: r.id, timestamp: r.timestamp, result: JSON.parse(r.json_snapshot) as ScanResult }))
}
