import bcrypt from 'bcryptjs'
import type { AdminUser } from '@/lib/cms/types'
import { readAdminDb, writeDb } from '@/lib/cms/store'

const ROUNDS = 12

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, ROUNDS)
}

export function isPasswordHash(value: string): boolean {
  return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$')
}

export function verifyPassword(stored: string, plain: string): boolean {
  if (isPasswordHash(stored)) {
    return bcrypt.compareSync(plain, stored)
  }
  return stored === plain
}

/** Upgrade legacy plaintext passwords after a successful login. */
export function upgradePasswordHashIfNeeded(user: AdminUser, plain: string) {
  if (isPasswordHash(user.password)) return
  const db = readAdminDb()
  const idx = db.users.findIndex((entry) => entry.id === user.id)
  if (idx < 0) return
  db.users[idx] = { ...db.users[idx], password: hashPassword(plain) }
  writeDb(db)
}
