import fs from 'fs'
import path from 'path'
import type BetterSqlite3 from 'better-sqlite3'
import { hashPassword, isPasswordHash } from '@/lib/security/password'
import { revalidateCmsCaches } from './cacheInvalidate'
import { createDefaultDb } from './seed'
import type {
  AdminSessionRecord,
  AnalyticsEvent,
  BrandSettings,
  CmsBeforeAfterItem,
  CmsDb,
  CmsGalleryItem,
  CmsReview,
  CmsService,
  Lead,
  AdminUser,
} from './types'
import type { Dictionary } from '@/i18n/types'

export type { AdminSessionRecord, AnalyticsEvent, CmsDb, Lead } from './types'

const DATA_DIR = process.env.CMS_DATA_DIR || path.join(process.cwd(), 'cms-data')
const SQLITE_FILE = path.join(DATA_DIR, 'emaro.sqlite')
const LEGACY_JSON = path.join(DATA_DIR, 'emaro.json')

type SqliteDatabase = BetterSqlite3.Database

declare global {
  // eslint-disable-next-line no-var
  var __emaroSqlite: SqliteDatabase | undefined
  // eslint-disable-next-line no-var
  var __emaroBuildDb: CmsDb | undefined
  // eslint-disable-next-line no-var
  var __emaroDefaultsDb: CmsDb | undefined
  // eslint-disable-next-line no-var
  var __emaroPublicCache: { at: number; data: CmsDb } | undefined
}

const PUBLIC_CACHE_MS = 60_000

function getDefaults(): CmsDb {
  if (!globalThis.__emaroDefaultsDb) {
    globalThis.__emaroDefaultsDb = createDefaultDb()
  }
  return globalThis.__emaroDefaultsDb
}

function invalidatePublicCache() {
  globalThis.__emaroPublicCache = undefined
  revalidateCmsCaches()
}

function isProductionBuild() {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

export function getCmsDataDir() {
  return DATA_DIR
}

export function getSqlitePath() {
  return SQLITE_FILE
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  const uploads = path.join(DATA_DIR, 'uploads')
  if (!fs.existsSync(uploads)) {
    fs.mkdirSync(uploads, { recursive: true })
  }
}

function loadSqlite(): typeof BetterSqlite3 {
  // Lazy-load so Next build workers do not dlopen the native addon unless needed.
  const { createRequire } = require('module') as typeof import('module')
  const requireFromHere = createRequire(__filename)
  return requireFromHere('better-sqlite3') as typeof BetterSqlite3
}

function countRows(db: SqliteDatabase, table: string) {
  const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number }
  return row.count
}

function getDb(): SqliteDatabase {
  if (isProductionBuild()) {
    throw new Error('SQLite is disabled during Next.js production build')
  }
  if (globalThis.__emaroSqlite) return globalThis.__emaroSqlite

  ensureDir()
  const Database = loadSqlite()
  const db = new Database(SQLITE_FILE)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS brand (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS copy_docs (
      locale TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS before_after (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      login TEXT UNIQUE NOT NULL,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      path TEXT NOT NULL,
      locale TEXT,
      created_at TEXT NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      login TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at);
    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_services_sort ON services(sort_order);
    CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery(sort_order);
    CREATE INDEX IF NOT EXISTS idx_before_after_sort ON before_after(sort_order);
    CREATE INDEX IF NOT EXISTS idx_reviews_sort ON reviews(sort_order);
  `)

  globalThis.__emaroSqlite = db
  bootstrapIfNeeded(db)
  return db
}

function writeBrand(db: SqliteDatabase, brand: BrandSettings) {
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO brand (id, data, updated_at) VALUES (1, @data, @updated_at)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  ).run({ data: JSON.stringify(brand), updated_at: now })
}

function writeCopy(db: SqliteDatabase, copy: { pl: Dictionary; uk: Dictionary }) {
  const now = new Date().toISOString()
  const stmt = db.prepare(
    `INSERT INTO copy_docs (locale, data, updated_at) VALUES (@locale, @data, @updated_at)
     ON CONFLICT(locale) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  )
  stmt.run({ locale: 'pl', data: JSON.stringify(copy.pl), updated_at: now })
  stmt.run({ locale: 'uk', data: JSON.stringify(copy.uk), updated_at: now })
}

function insertOrdered(
  db: SqliteDatabase,
  table: 'services' | 'gallery' | 'before_after' | 'reviews',
  items: Array<Record<string, unknown>>,
) {
  const now = new Date().toISOString()
  const stmt = db.prepare(
    `INSERT INTO ${table} (id, data, sort_order, updated_at) VALUES (@id, @data, @sort_order, @updated_at)`,
  )
  items.forEach((item, index) => {
    stmt.run({
      id: String(item.id),
      data: JSON.stringify(item),
      sort_order: index,
      updated_at: now,
    })
  })
}

function insertLeads(db: SqliteDatabase, items: Lead[]) {
  const now = new Date().toISOString()
  const stmt = db.prepare(
    `INSERT INTO leads (id, data, created_at, updated_at) VALUES (@id, @data, @created_at, @updated_at)`,
  )
  for (const item of items) {
    stmt.run({
      id: item.id,
      data: JSON.stringify(item),
      created_at: item.createdAt || now,
      updated_at: item.updatedAt || now,
    })
  }
}

function insertUsers(db: SqliteDatabase, items: AdminUser[]) {
  const now = new Date().toISOString()
  const stmt = db.prepare(
    `INSERT INTO users (id, login, data, updated_at) VALUES (@id, @login, @data, @updated_at)`,
  )
  for (const item of items) {
    stmt.run({
      id: item.id,
      login: item.login,
      data: JSON.stringify(item),
      updated_at: now,
    })
  }
}

function insertAnalytics(db: SqliteDatabase, items: AnalyticsEvent[]) {
  const now = new Date().toISOString()
  const stmt = db.prepare(
    `INSERT INTO analytics (id, type, path, locale, created_at, data)
     VALUES (@id, @type, @path, @locale, @created_at, @data)`,
  )
  for (const item of items) {
    stmt.run({
      id: item.id,
      type: item.type,
      path: item.path,
      locale: item.locale || null,
      created_at: item.createdAt || now,
      data: JSON.stringify(item),
    })
  }
}

function seedDatabase(db: SqliteDatabase, seed: CmsDb) {
  const users = seed.users.map((user) => ({
    ...user,
    password: isPasswordHash(user.password) ? user.password : hashPassword(user.password),
  }))

  const tx = db.transaction(() => {
    writeBrand(db, seed.brand)
    writeCopy(db, seed.copy)
    insertOrdered(db, 'services', seed.services as unknown as Array<Record<string, unknown>>)
    insertOrdered(db, 'gallery', seed.gallery as unknown as Array<Record<string, unknown>>)
    insertOrdered(db, 'before_after', seed.beforeAfter as unknown as Array<Record<string, unknown>>)
    insertOrdered(db, 'reviews', seed.reviews as unknown as Array<Record<string, unknown>>)
    insertLeads(db, seed.leads)
    insertUsers(db, users)
    insertAnalytics(db, seed.analytics)
    db.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('seeded', '1')`).run()
  })
  tx()
}

function mergeLegacyJson(parsed: Partial<CmsDb>): CmsDb {
  const defaults = getDefaults()
  return {
    ...defaults,
    ...parsed,
    brand: { ...defaults.brand, ...(parsed.brand || {}) },
    services: parsed.services?.length ? parsed.services : defaults.services,
    gallery: parsed.gallery?.length ? parsed.gallery : defaults.gallery,
    beforeAfter: parsed.beforeAfter?.length ? parsed.beforeAfter : defaults.beforeAfter,
    reviews: parsed.reviews?.length ? parsed.reviews : defaults.reviews,
    copy: {
      pl: parsed.copy?.pl ? { ...defaults.copy.pl, ...parsed.copy.pl } : defaults.copy.pl,
      uk: parsed.copy?.uk ? { ...defaults.copy.uk, ...parsed.copy.uk } : defaults.copy.uk,
    },
    leads: parsed.leads || [],
    analytics: parsed.analytics || [],
    users: parsed.users?.length ? parsed.users : defaults.users,
    sessions: [],
  }
}

function bootstrapIfNeeded(db: SqliteDatabase) {
  const seeded = db.prepare(`SELECT value FROM meta WHERE key = 'seeded'`).get() as
    | { value: string }
    | undefined

  if (seeded?.value === '1' && countRows(db, 'services') > 0) {
    return
  }

  if (fs.existsSync(LEGACY_JSON)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(LEGACY_JSON, 'utf8')) as Partial<CmsDb>
      seedDatabase(db, mergeLegacyJson(parsed))

      // Migrate sessions from legacy JSON if present
      if (parsed.sessions?.length) {
        for (const session of parsed.sessions) {
          saveAdminSession(session)
        }
      }

      try {
        fs.renameSync(LEGACY_JSON, `${LEGACY_JSON}.migrated`)
      } catch {
        // ignore rename errors
      }
      return
    } catch {
      // fall through to default seed
    }
  }

  if (countRows(db, 'services') === 0) {
    seedDatabase(db, createDefaultDb())
  } else {
    db.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('seeded', '1')`).run()
  }
}

function readOrdered<T>(db: SqliteDatabase, table: string): T[] {
  const rows = db
    .prepare(`SELECT data FROM ${table} ORDER BY sort_order ASC, rowid ASC`)
    .all() as Array<{ data: string }>
  return rows.map((row) => JSON.parse(row.data) as T)
}

function readCollection<T>(db: SqliteDatabase, table: string, orderBy = 'rowid ASC'): T[] {
  const rows = db.prepare(`SELECT data FROM ${table} ORDER BY ${orderBy}`).all() as Array<{
    data: string
  }>
  return rows.map((row) => JSON.parse(row.data) as T)
}

function replaceOrdered(
  db: SqliteDatabase,
  table: 'services' | 'gallery' | 'before_after' | 'reviews',
  items: Array<Record<string, unknown>>,
) {
  db.prepare(`DELETE FROM ${table}`).run()
  insertOrdered(db, table, items)
}

export function readDb(): CmsDb {
  if (isProductionBuild()) {
    if (!globalThis.__emaroBuildDb) {
      globalThis.__emaroBuildDb = getDefaults()
    }
    return structuredClone(globalThis.__emaroBuildDb)
  }

  const cached = globalThis.__emaroPublicCache
  if (cached && Date.now() - cached.at < PUBLIC_CACHE_MS) {
    return cached.data
  }

  const db = getDb()
  const defaults = getDefaults()

  const brandRow = db.prepare(`SELECT data FROM brand WHERE id = 1`).get() as
    | { data: string }
    | undefined
  const plRow = db.prepare(`SELECT data FROM copy_docs WHERE locale = 'pl'`).get() as
    | { data: string }
    | undefined
  const ukRow = db.prepare(`SELECT data FROM copy_docs WHERE locale = 'uk'`).get() as
    | { data: string }
    | undefined

  const data: CmsDb = {
    brand: brandRow
      ? { ...defaults.brand, ...(JSON.parse(brandRow.data) as BrandSettings) }
      : defaults.brand,
    services: readOrdered<CmsService>(db, 'services'),
    gallery: readOrdered<CmsGalleryItem>(db, 'gallery'),
    beforeAfter: readOrdered<CmsBeforeAfterItem>(db, 'before_after'),
    reviews: readOrdered<CmsReview>(db, 'reviews'),
    copy: {
      pl: plRow
        ? ({ ...defaults.copy.pl, ...(JSON.parse(plRow.data) as Dictionary) } as Dictionary)
        : defaults.copy.pl,
      uk: ukRow
        ? ({ ...defaults.copy.uk, ...(JSON.parse(ukRow.data) as Dictionary) } as Dictionary)
        : defaults.copy.uk,
    },
    // Heavy admin collections — load lazily via dedicated helpers when needed
    leads: [],
    analytics: [],
    users: [],
    sessions: [],
  }

  globalThis.__emaroPublicCache = { at: Date.now(), data }
  return data
}

/** Full DB including leads/analytics/users — for admin APIs only. */
export function readAdminDb(): CmsDb {
  if (isProductionBuild()) {
    return readDb()
  }

  const db = getDb()
  const base = readDb()
  return {
    ...base,
    leads: readCollection<Lead>(db, 'leads', 'created_at DESC'),
    analytics: readCollection<AnalyticsEvent>(db, 'analytics', 'created_at ASC'),
    users: readCollection<AdminUser>(db, 'users'),
    sessions: [],
  }
}

export function writeDb(cms: CmsDb) {
  if (isProductionBuild()) {
    globalThis.__emaroBuildDb = structuredClone(cms)
    invalidatePublicCache()
    return
  }

  const db = getDb()
  const tx = db.transaction(() => {
    writeBrand(db, cms.brand)
    writeCopy(db, cms.copy)
    replaceOrdered(db, 'services', cms.services as unknown as Array<Record<string, unknown>>)
    replaceOrdered(db, 'gallery', cms.gallery as unknown as Array<Record<string, unknown>>)
    replaceOrdered(
      db,
      'before_after',
      cms.beforeAfter as unknown as Array<Record<string, unknown>>,
    )
    replaceOrdered(db, 'reviews', cms.reviews as unknown as Array<Record<string, unknown>>)

    db.prepare(`DELETE FROM leads`).run()
    insertLeads(db, cms.leads)

    db.prepare(`DELETE FROM users`).run()
    insertUsers(db, cms.users)

    db.prepare(`DELETE FROM analytics`).run()
    insertAnalytics(db, cms.analytics)

    db.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('seeded', '1')`).run()
  })
  tx()
  invalidatePublicCache()
}

export function updateDb(mutator: (db: CmsDb) => void): CmsDb {
  const cms = readAdminDb()
  mutator(cms)
  writeDb(cms)
  return cms
}

export function saveAdminSession(record: AdminSessionRecord) {
  if (isProductionBuild()) return
  const db = getDb()
  db.prepare(
    `INSERT OR REPLACE INTO admin_sessions
      (token, user_id, login, created_at, expires_at)
     VALUES (@token, @user_id, @login, @created_at, @expires_at)`,
  ).run({
    token: record.token,
    user_id: record.userId,
    login: record.login,
    created_at: record.createdAt,
    expires_at: record.expiresAt,
  })
}

export function loadAdminSession(token: string): AdminSessionRecord | null {
  if (isProductionBuild() || !token) return null
  const db = getDb()
  const row = db
    .prepare(
      `SELECT token, user_id, login, created_at, expires_at
       FROM admin_sessions WHERE token = ?`,
    )
    .get(token) as
    | {
        token: string
        user_id: string
        login: string
        created_at: string
        expires_at: string
      }
    | undefined

  if (!row) return null
  return {
    token: row.token,
    userId: row.user_id,
    login: row.login,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  }
}

export function deleteAdminSession(token: string | undefined) {
  if (isProductionBuild() || !token) return
  const db = getDb()
  db.prepare(`DELETE FROM admin_sessions WHERE token = ?`).run(token)
}

export function purgeExpiredAdminSessions() {
  if (isProductionBuild()) return
  const db = getDb()
  db.prepare(`DELETE FROM admin_sessions WHERE expires_at < ?`).run(new Date().toISOString())
}

export function appendLead(lead: Lead) {
  if (isProductionBuild()) {
    updateDb((db) => {
      db.leads.unshift(lead)
    })
    return
  }

  const db = getDb()
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO leads (id, data, created_at, updated_at) VALUES (@id, @data, @created_at, @updated_at)`,
  ).run({
    id: lead.id,
    data: JSON.stringify(lead),
    created_at: lead.createdAt || now,
    updated_at: lead.updatedAt || now,
  })
}

export function appendAnalytics(event: AnalyticsEvent) {
  if (isProductionBuild()) {
    updateDb((db) => {
      db.analytics.push(event)
      if (db.analytics.length > 8000) db.analytics = db.analytics.slice(-6000)
    })
    return
  }

  const db = getDb()
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO analytics (id, type, path, locale, created_at, data)
     VALUES (@id, @type, @path, @locale, @created_at, @data)`,
  ).run({
    id: event.id,
    type: event.type,
    path: event.path,
    locale: event.locale || null,
    created_at: event.createdAt || now,
    data: JSON.stringify(event),
  })

  const count = countRows(db, 'analytics')
  if (count > 8000) {
    db.prepare(
      `DELETE FROM analytics WHERE id IN (
        SELECT id FROM analytics ORDER BY created_at ASC LIMIT ?
      )`,
    ).run(count - 6000)
  }
}
