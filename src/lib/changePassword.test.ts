import { expect, test } from 'bun:test';
import { createPasswordChange } from './changePassword';

test('signed-in change sends current and new passwords to the auth server', async () => {
  let attributes: unknown;
  const change = createPasswordChange(async value => { attributes = value; return { error: null }; });
  await change('old-test-password', 'new-test-password', 'new-test-password');
  expect(attributes).toEqual({ current_password: 'old-test-password', password: 'new-test-password' });
});
test('a mismatched confirmation never changes the password', async () => {
  let calls = 0;
  const change = createPasswordChange(async () => { calls++; return { error: null }; });
  await change('old-test-password', 'new-test-password', 'different-test-password');
  expect(calls).toBe(0);
});
test('a missing current password never changes the password', async () => {
  let calls = 0;
  const change = createPasswordChange(async () => { calls++; return { error: null }; });
  await change('', 'new-test-password', 'new-test-password');
  expect(calls).toBe(0);
});