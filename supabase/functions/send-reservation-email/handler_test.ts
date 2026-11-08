import { assertEquals } from 'https://deno.land/std@0.190.0/testing/asserts.ts';
import { createHandler, type Dependencies, type StoredReservation } from './handler.ts';

const payload = { nome: 'Teste', sobrenome: 'Reserva', email: 'teste@example.com', uso: 'Teste de reserva',
  inicio: '2026-12-01T09:00:00Z', termino: '2026-12-01T10:00:00Z', tipoReserva: 'auditorio' };
const request = (body = payload) => new Request('http://localhost', { method: 'POST', body: JSON.stringify(body) });

function setup(secretary = 'secretaria.cpgg.ufba@gmail.com', fail = false) {
  const rows = new Map<string, StoredReservation>();
  const messages: { to: string[] }[] = [];
  const deps: Dependencies = {
    async insert(row) { if (rows.has(row.id)) return 'duplicate'; rows.set(row.id, { ...row }); return 'created'; },
    async find(id) { return rows.get(id) || null; },
    async mark(id, status) { const row = rows.get(id); if (row) row.notification_status = status; },
    async secretary() { return secretary; },
    async send(message) { messages.push(message); return { success: !fail }; },
  };
  return { handler: createHandler(deps), messages, rows };
}

for (const tipoReserva of ['auditorio', 'sala_reuniao']) {
  Deno.test(`${tipoReserva}: repeated and concurrent submissions send only one secretary email`, async () => {
    const { handler, messages, rows } = setup();
    const body = { ...payload, tipoReserva };
    const responses = await Promise.all(Array.from({ length: 8 }, () => handler(request(body))));
    assertEquals(responses.some(result => result.status === 200), true);
    const retry = await handler(request(body));
    assertEquals(retry.status, 200);
    assertEquals((await retry.json()).duplicate, true);
    assertEquals(rows.size, 1);
    assertEquals(messages.length, 1);
    assertEquals(messages.flatMap(message => message.to).filter(email => email === 'secretaria.cpgg.ufba@gmail.com').length, 1);
  });
}

Deno.test('overlapping secretary and coordinator recipients receive only one email', async () => {
  const { handler, messages } = setup(' Milton.Porsani@gmail.com ');
  assertEquals((await handler(request())).status, 200);
  assertEquals(messages[0].to, ['milton.porsani@gmail.com']);
});

Deno.test('uncertain SMTP result never automatically resends on retry', async () => {
  const { handler, messages, rows } = setup(undefined, true);
  assertEquals((await handler(request())).status, 502);
  assertEquals((await handler(request())).status, 409);
  assertEquals(messages.length, 1);
  assertEquals([...rows.values()][0].notification_status, 'uncertain');
});

Deno.test('different space reservations still send separate notifications', async () => {
  const { handler, messages } = setup();
  await handler(request());
  await handler(request({ ...payload, inicio: '2026-12-02T09:00:00Z', termino: '2026-12-02T10:00:00Z' }));
  assertEquals(messages.length, 2);
});

Deno.test('invalid requests never save or send', async () => {
  const { handler, messages, rows } = setup();
  assertEquals((await handler(request({ ...payload, email: 'invalid' }))).status, 400);
  assertEquals(rows.size, 0);
  assertEquals(messages.length, 0);
});