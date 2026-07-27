import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.22.4";

const BodySchema = z.object({
  user_id: z.string().uuid("ID de usuário inválido"),
  full_name: z.string().min(1, "Nome completo é obrigatório").max(255),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().min(1, "Telefone é obrigatório").max(20),
  laboratory_id: z.string().uuid("ID de laboratório inválido"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return new Response(
        JSON.stringify({ success: false, error: "Dados inválidos", details: errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { user_id, full_name, email, phone, laboratory_id } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the referenced user exists in auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Usuário não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the laboratory exists and validate the technician name
    const { data: labData, error: labError } = await supabase
      .from("laboratories")
      .select("id, technician_name")
      .eq("id", laboratory_id)
      .single();

    if (labError || !labData) {
      return new Response(
        JSON.stringify({ success: false, error: "Laboratório não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const registeredTechName = (labData.technician_name ?? "").trim();
    if (!registeredTechName) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Este laboratório ainda não tem um técnico autorizado. Peça ao coordenador para cadastrar o nome do técnico no painel de administração.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (full_name.trim() !== registeredTechName) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "O nome informado não confere com o técnico autorizado para este laboratório. Digite o nome exatamente como cadastrado pela coordenação.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const first_name = full_name.trim().split(" ")[0];

    // Create user profile if it doesn't exist (ignore duplicates so we don't overwrite existing researcher profiles)
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert(
        {
          user_id,
          full_name: full_name.trim(),
          email: email.trim(),
          institution: "UFBA",
          phone: phone.trim(),
          first_name,
          researcher_route: null,
        },
        { ignoreDuplicates: true }
      );

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao criar perfil de usuário" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create technician profile
    const { error: technicianError } = await supabase
      .from("technician_profiles")
      .insert(
        {
          user_id,
          laboratory_id,
        },
        { ignoreDuplicates: true }
      );

    if (technicianError) {
      console.error("Error creating technician profile:", technicianError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao criar perfil de técnico" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in register-technician:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
