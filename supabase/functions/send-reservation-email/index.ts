import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail } from '../_shared/smtp-client.ts';
import { createHandler } from './handler.ts';

const url = Deno.env.get('SUPABASE_URL');
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!url || !key) throw new Error('Missing Supabase configuration');
const supabase = createClient(url, key);

// This is intentionally a public reservation form; it does not require login.
Deno.serve(createHandler({
  async insert(row) {
    const { error } = await supabase.from('reservations').insert(row);
    if (error?.code === '23505') return 'duplicate';
    if (error) throw error;
    return 'created';
  },
  async find(id) {
    const { data, error } = await supabase.from('reservations').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async mark(id, notification_status) {
    const { error } = await supabase.from('reservations').update({ notification_status }).eq('id', id);
    if (error) throw error;
  },
  async secretary() {
    const { data, error } = await supabase.from('admin_users').select('email')
      .eq('role', 'secretaria').order('created_at').limit(1).maybeSingle();
    if (error) throw error;
    return data?.email || 'secretaria.cpgg.ufba@gmail.com';
  },
  send: sendEmail,
}));
