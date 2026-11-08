import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: "Token de autenticação ausente" }, { status: 401 });
    }

    // Verify the user is authenticated and get their user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return json({ error: "Não autenticado" }, { status: 401 });
    }

    // Check if user is admin with coordenacao role
    const { data: allowed, error: permissionError } = await supabase.rpc('has_access_permission', { _user_id: user.id, _permission: 'people' });

    if (permissionError || allowed !== true) {
      return json({ error: "Não autorizado - apenas coordenação e secretaria" }, { status: 401 });
    }

    const { action, id, name, data } = await req.json();

    if (action === "delete") {
      if (!id) return json({ error: "ID obrigatório" }, { status: 400 });

      // First get the researcher's email to find associated user_profile
      const { data: researcher, error: fetchErr } = await supabase
        .from("researchers")
        .select("email")
        .eq("id", id)
        .single();

      if (fetchErr && fetchErr.code !== 'PGRST116') {
        return json({ error: fetchErr.message }, { status: 400 });
      }

      // Delete from researchers table
      const { error: delErr } = await supabase
        .from("researchers")
        .delete()
        .eq("id", id);

      if (delErr) return json({ error: delErr.message }, { status: 400 });

      // If researcher has an email, try to delete associated user_profile
      if (researcher?.email) {
        const { error: profileDelErr } = await supabase
          .from("user_profiles")
          .delete()
          .eq("email", researcher.email);

        // Ignore error if no profile exists
        if (profileDelErr && profileDelErr.code !== 'PGRST116') {
          console.log("Warning: Could not delete user_profile:", profileDelErr.message);
        }
      }

      return json({ ok: true });
    }

    if (action === "update") {
      if (!id || !name) return json({ error: "ID e nome são obrigatórios" }, { status: 400 });

      const { error: updErr } = await supabase
        .from("researchers")
        .update({ name })
        .eq("id", id);

      if (updErr) return json({ error: updErr.message }, { status: 400 });
      return json({ ok: true });
    }

    if (action === "restore") {
      if (!data) return json({ error: "Dados obrigatórios" }, { status: 400 });

      const researcherData = data;
      const { error: insertErr } = await supabase
        .from("researchers")
        .insert({
          id: researcherData.id,
          name: researcherData.name,
          email: researcherData.email,
          program: researcherData.program,
          description: researcherData.description,
          lattes_link: researcherData.lattes_link
        });

      if (insertErr) return json({ error: insertErr.message }, { status: 400 });
      return json({ ok: true });
    }

    return json({ error: "Ação inválida" }, { status: 400 });
  } catch (e) {
    return json({ error: String(e) }, { status: 500 });
  }
});
