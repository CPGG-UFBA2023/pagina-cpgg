import { describe, expect, test } from 'bun:test'
import { permissionGroups, hasAnyPermission, mayChangePermission } from './accessPermissions'

describe('Administrative access rules', () => {
  test('all requested areas are represented', () => {
    expect(permissionGroups.flatMap(group => group.items.map(([key]) => key))).toEqual(['atas','news','photos','calendars','publications','projects','regulations','history','tcc','laboratories','equipment','repository','reservations','people','access'])
  })
  test('people management alone cannot grant privileges', () => {
    expect(mayChangePermission({ people: true }, 'admin', 'researcher', 'atas', true)).toBe(false)
  })
  test('access administrators can grant a registered researcher a privilege', () => {
    expect(mayChangePermission({ access: true }, 'admin', 'researcher', 'atas', true)).toBe(true)
  })
  test('people without accounts cannot receive active privileges', () => {
    expect(mayChangePermission({ access: true }, 'admin', null, 'atas', true)).toBe(false)
  })
  test('administrators cannot revoke their own access management', () => {
    expect(mayChangePermission({ access: true }, 'admin', 'admin', 'access', false)).toBe(false)
  })
  test('signed-out and unprivileged users cannot enter the admin workspace', () => {
    expect(hasAnyPermission({})).toBe(false)
    expect(hasAnyPermission({ atas: false })).toBe(false)
    expect(hasAnyPermission({ atas: true })).toBe(true)
  })
})