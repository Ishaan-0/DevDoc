import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database | null = null

function appDataPath(): string {
  try {
    const userDataPath = app.getPath('userData')
    if (!existsSync(userDataPath)) {
      mkdirSync(userDataPath, { recursive: true })
    }
    return join(userDataPath, 'devdoc.db')
  } catch {
    // app not available (e.g. in tests)
    return ':memory:'
  }
}

export function initDb(path?: string): Database.Database {
  const dbPath = path ?? appDataPath()
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      json_snapshot TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  return db
}

export function getDb(): Database.Database {
  if (!db) {
    db = initDb()
  }
  return db
}
