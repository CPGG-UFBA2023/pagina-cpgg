import { describe, expect, test } from 'bun:test'
import { hasLaigaRepositoryAccess } from './laigaRepositoryAccess'

describe('LAIGA repository authorization', () => {
  test('authorized members can open folders without access-management privileges', async () => {
    expect(await hasLaigaRepositoryAccess(async () => ({ data: true, error: null }))).toBe(true)
  })
  test('revoked repository access is denied', async () => {
    expect(await hasLaigaRepositoryAccess(async () => ({ data: false, error: null }))).toBe(false)
  })
  test('failed permission checks never grant access', async () => {
    expect(await hasLaigaRepositoryAccess(async () => ({ data: true, error: new Error('Unavailable') }))).toBe(false)
    expect(await hasLaigaRepositoryAccess(async () => ({ data: null, error: null }))).toBe(false)
  })
})