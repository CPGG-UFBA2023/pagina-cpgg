import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3';
import { sendEmail } from "../_shared/smtp-client.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RepairRequest {
  nome: string;
  sobrenome: string;
  email: string;
  problemType: string;
  problemDescription: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, sobrenome, email, problemType, problemDescription }: RepairRequest = await req.json();
    
    console.log('Recebida solicitação de reparo:', { nome, sobrenome, email, problemType });

    // Salvar no banco de dados primeiro
    const { data: savedRequest, error: dbError } = await supabase
      .from('repair_requests')
      .insert({
        nome,
        sobrenome,
        email,
        problem_type: problemType,
        problem_description: problemDescription,
        status: 'pendente'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar solicitação no banco:', dbError);
      throw new Error('Erro ao salvar solicitação');
    }

    console.log('Solicitação salva no banco:', savedRequest);

    // Buscar email do técnico de TI da tabela admin_users
    let tiEmail = "bianca.andrade@ufba.br"; // Email padrão como fallback
    const { data: tiUser, error: tiError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('role', 'ti')
      .limit(1)
      .single();
    
    if (tiUser && tiUser.email) {
      tiEmail = tiUser.email;
      console.log('Email do técnico de TI encontrado:', tiEmail);
    } else {
      console.log('Usando email padrão de TI:', tiEmail, 'Erro:', tiError?.message);
    }

    // Buscar email da secretaria da tabela admin_users
    let secretariaEmail = "secretaria.cpgg.ufba@gmail.com"; // Email padrão como fallback
    const { data: secretariaUser, error: secretariaError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('role', 'secretaria')
      .limit(1)
      .single();
    
    if (secretariaUser && secretariaUser.email) {
      secretariaEmail = secretariaUser.email;
      console.log('Email da secretaria encontrado:', secretariaEmail);
    } else {
      console.log('Usando email padrão de secretaria:', secretariaEmail, 'Erro:', secretariaError?.message);
    }
    
    const destinatario = problemType === 'infraestrutura' ? secretariaEmail : tiEmail;
    const departamento = problemType === 'infraestrutura' ? 'Secretaria (Infraestrutura)' : 'T.I.';

    console.log(`Enviando email para ${departamento}: ${destinatario}`);

    const emailResult = await sendEmail({
      to: destinatario,
      subject: `Solicitação de Reparo - ${departamento}`,
      html: `
        <h2>Nova Solicitação de Reparo</h2>
        <p><strong>Solicitante:</strong> ${nome} ${sobrenome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Tipo de Problema:</strong> ${problemType === 'infraestrutura' ? 'Problema de infraestrutura' : 'Problema de T.I.'}</p>
        <p><strong>Departamento:</strong> ${departamento}</p>
        <hr>
        <h3>Descrição do Problema:</h3>
        <p>${problemDescription}</p>
        <hr>
        <p style="font-size: 12px; color: #666;">Esta solicitação foi enviada automaticamente através do sistema de reservas do CPGG.</p>
      `,
      replyTo: email,
    });

    if (!emailResult.success) {
      console.error("Erro ao enviar email:", emailResult.error);
      throw new Error(`Falha ao enviar email: ${emailResult.error}`);
    }

    console.log("Email enviado com sucesso via SMTP");

    return new Response(JSON.stringify({ success: true, id: savedRequest.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de reparo:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
