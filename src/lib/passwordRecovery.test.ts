import { describe, expect, test } from 'bun:test';
import { createRecoveryRequest, recoveryErrorMessage } from './passwordRecovery';

describe('Password recovery', () => {
  test('requests a recovery link for the existing account without recreating it', async () => {
    const calls: unknown[] = [];
    const request = createRecoveryRequest(async (email, options) => {
      calls.push({ email, options });
      return { error: null };
    });
    await request(' technician@example.org ', 'https://cpgg.example.org');
    expect(calls).toEqual([{ email: 'technician@example.org', options: { redirectTo: 'https://cpgg.example.org/reset-password' } }]);
  });
  test('concurrent clicks send only one email request', async () => {
    let calls = 0;
    let finish: (() => void) | undefined;
    const gate = new Promise<void>(resolve => { finish = resolve; });
    const request = createRecoveryRequest(async () => { calls++; await gate; return { error: null }; });
    const first = request('tech@example.org', 'https://cpgg.example.org');
    expect((await request('tech@example.org', 'https://cpgg.example.org')).skipped).toBe(true);
    finish?.();
    await first;
    expect(calls).toBe(1);
  });
  test('SMTP failure is returned instead of reporting success', async () => {
    const error = { status: 500, code: 'unexpected_failure' };
    const request = createRecoveryRequest(async () => ({ error }));
    expect((await request('tech@example.org', 'https://cpgg.example.org')).error).toEqual(error);
    expect(recoveryErrorMessage(error) === recoveryErrorMessage({ status: 429 })).toBe(false);
  });
});