import { z } from 'npm:zod@3.25.76';
import { corsHeaders } from 'npm:@supabase/supabase-js@2.119.0/cors';

const schema = z.object({
  nome: z.string().trim().min(1).max(255),
  sobrenome: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255).transform(value => value.toLowerCase()),
  uso: z.string().trim().min(1).max(5000),
  inicio: z.string().max(64).refine(value => Number.isFinite(Date.parse(value))),
  termino: z.string().max(64).refine(value => Number.isFinite(Date.parse(value))),
  tipoReserva: z.enum(['auditorio', 'sala_reuniao']),
}).refine(value => Date.parse(value.termino) > Date.parse(value.inicio), {
  message: 'O término deve ser posterior ao início.',
});

export interface StoredReservation {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  uso: string;
  inicio: string;
  termino: string;
  tipo_reserva: string;
  notification_status: string | null;
}

export interface Dependencies {
  insert: (row: StoredReservation) => Promise<'created' | 'duplicate'>;
  find: (id: string) => Promise<StoredReservation | null>;
  mark: (id: string, status: string) => Promise<void>;
  secretary: () => Promise<string>;
  send: (message: { to: string[]; subject: string; html: string; replyTo: string }) => Promise<{ success: boolean; error?: string }>;
}

const response = (body: object, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] || character));

// A deterministic primary key makes the database insert an atomic send claim,
// including requests from older published forms and retries on another instance.
export async function reservationId(row: Omit<StoredReservation, 'id' | 'notification_status'>) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([
    row.nome.toLowerCase(), row.sobrenome.toLowerCase(), row.email,
    row.uso, row.inicio, row.termino, row.tipo_reserva,
  ])));
  const hex = Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function createHandler(deps: Dependencies) {
  return async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return response({ success: false, error: 'Método não permitido.' }, 405);
    let body: unknown;
    try { body = await req.json(); } catch { return response({ success: false, error: 'Dados inválidos.' }, 400); }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return response({ success: false, error: 'Confira os campos e as datas da reserva.' }, 400);
    const { nome, sobrenome, email, uso, inicio, termino, tipoReserva } = parsed.data;
    const row = {
      nome, sobrenome, email, uso, inicio: new Date(inicio).toISOString(),
      termino: new Date(termino).toISOString(), tipo_reserva: tipoReserva,
    };
    const id = await reservationId(row);
    try {
      // Resolve recipient before claiming: a lookup failure cannot strand a send.
      const secretary = await deps.secretary();
      const claim = await deps.insert({ ...row, id, notification_status: 'sending' });
      if (claim === 'duplicate') {
        const existing = await deps.find(id);
        if (existing?.notification_status === 'sent') {
          return response({ success: true, reservationId: id, duplicate: true });
        }
        return response({ success: false, reservationId: id, error:
          existing?.notification_status === 'sending'
            ? 'Esta solicitação já está sendo enviada. Aguarde antes de verificar novamente.'
            : 'A solicitação foi registrada, mas o envio do e-mail não pôde ser confirmado. Contate a secretaria informando o protocolo: ' + id,
        }, 409);
      }
      const space = tipoReserva === 'auditorio' ? 'Auditório' : 'Sala de Reuniões';
      const recipients = [...new Set((tipoReserva === 'auditorio'
        ? [secretary, 'milton.porsani@gmail.com'] : [secretary]).map(value => value.trim().toLowerCase()))];
      try {
        const result = await deps.send({
          to: recipients, subject: `Nova Solicitação de Reserva - ${space}`, replyTo: email,
          html: `<h2>Nova Solicitação de Reserva - ${space}</h2><ul>
            <li><strong>Nome:</strong> ${escapeHtml(nome)} ${escapeHtml(sobrenome)}</li>
            <li><strong>E-mail:</strong> ${escapeHtml(email)}</li>
            <li><strong>Espaço:</strong> ${space} do CPGG</li>
            <li><strong>Finalidade:</strong> ${escapeHtml(uso)}</li>
            <li><strong>Data/Hora de Início:</strong> ${new Date(inicio).toLocaleString('pt-BR')}</li>
            <li><strong>Data/Hora de Término:</strong> ${new Date(termino).toLocaleString('pt-BR')}</li>
            <li><strong>Protocolo:</strong> ${id}</li></ul>
            <p>Entre em contato com o solicitante para confirmar a disponibilidade.</p>`,
        });
        if (!result.success) throw new Error(result.error || 'Falha SMTP');
        await deps.mark(id, 'sent');
      } catch (error) {
        console.error('Reservation notification outcome uncertain:', id, error);
        // SMTP may have accepted the message even when its response is lost.
        // Never release this claim or automatically resend an uncertain outcome.
        await deps.mark(id, 'uncertain').catch(error => console.error('Failed to mark notification:', error));
        return response({ success: false, reservationId: id, error:
          'A solicitação foi registrada, mas o envio do e-mail não pôde ser confirmado. Contate a secretaria informando o protocolo: ' + id,
        }, 502);
      }
      return response({ success: true, reservationId: id, message: 'Reserva salva e e-mail enviado para secretaria' });
    } catch (error) {
      console.error('Reservation processing error:', error);
      return response({ success: false, error: 'Não foi possível processar a reserva. Tente novamente.' }, 500);
    }
  };
}