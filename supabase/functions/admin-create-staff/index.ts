import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...corsHeaders, ...(init.headers || {}) },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Não autenticado" }, { status: 401 });

    const { data: { user }, error: authError } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) return json({ error: "Não autenticado" }, { status: 401 });

    const { data: caller } = await admin
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "coordenacao")
      .maybeSingle();

    if (!caller) return json({ error: "Não autorizado - apenas coordenação" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const password = body.password ? String(body.password) : null;
    const role = String(body.role || "").trim();
    const fullName = body.full_name ? String(body.full_name).trim() : null;

    if (!email || !email.includes("@")) return json({ error: "E-mail inválido" }, { status: 400 });
    if (!["secretaria", "ti", "coordenacao"].includes(role)) {
      return json({ error: "Perfil inválido" }, { status: 400 });
    }
    if (password && password.length < 6) {
      return json({ error: "Senha deve ter no mínimo 6 caracteres" }, { status: 400 });
    }

    // Find or create the auth user
    let userId: string | null = null;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users?.find((u) => (u.email || "").toLowerCase() === email);

    if (existing) {
      userId = existing.id;
      if (password) {
        const { error: updErr } = await admin.auth.admin.updateUserById(userId, { password });
        if (updErr) return json({ error: updErr.message }, { status: 400 });
      }
    } else if (password) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName || email.split("@")[0] },
      });
      if (createErr) return json({ error: createErr.message }, { status: 400 });
      userId = created.user?.id ?? null;
    }

    const { error: upsertErr } = await admin
      .from("admin_users")
      .upsert(
        { email, role, ...(fullName ? { full_name: fullName } : {}), ...(userId ? { user_id: userId } : {}) },
        { onConflict: "email" },
      );

    if (upsertErr) return json({ error: upsertErr.message }, { status: 400 });

    return json({ ok: true, user_id: userId, account_created: !existing && !!password });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
});
