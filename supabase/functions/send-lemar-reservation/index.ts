import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3'
import { sendEmail } from "../_shared/smtp-client.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LemarReservationRequest {
  sampleType: string
  analysisType: string[]
  numberOfSamples: string
  sampleDescription: string
  applicantName: string
  applicantEmail: string
  applicantInstitution: string
  purpose: string
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    console.log('Iniciando processamento da solicitação LEMAR...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const reservationData: LemarReservationRequest = await req.json()
    console.log('Dados recebidos:', JSON.stringify(reservationData, null, 2))

    // Salvar no banco de dados
    console.log('Salvando no banco de dados...')
    const { data: reservation, error: dbError } = await supabase
      .from('reservations')
      .insert({
        nome: reservationData.applicantName,
        sobrenome: '',
        email: reservationData.applicantEmail,
        uso: `${reservationData.purpose} - Análises: ${reservationData.analysisType.join(', ')} - Amostras: ${reservationData.numberOfSamples} (${reservationData.sampleType || 'não especificado'})`,
        inicio: new Date().toISOString(),
        termino: new Date().toISOString(),
        tipo_reserva: 'lemar_analysis'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Erro no banco de dados:', dbError)
      throw new Error(`Erro no banco de dados: ${dbError.message}`)
    }

    console.log('Reserva salva com sucesso:', reservation.id)

    // Buscar email do chefe do LEMAR
    const { data: labData, error: labError } = await supabase
      .from('laboratories')
      .select('chief_alternative_email, chief_name')
      .eq('acronym', 'LEMAR')
      .single()

    if (labError) {
      console.error('Erro ao buscar dados do laboratório:', labError)
    }

    const chiefEmail = labData?.chief_alternative_email || 'eduardo.junior@ufba.br'
    const chiefName = labData?.chief_name || 'Prof. Dr. Eduardo Reis Viana Rocha Júnior'
    
    console.log('Email do chefe encontrado:', chiefEmail)

    const analysisList = reservationData.analysisType.join(', ')

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #592cbb;">Nova Solicitação de Análise - LEMAR</h2>
        <hr style="border: 1px solid #592cbb;" />
        
        <h3 style="color: #333;">Dados do Solicitante</h3>
        <p><strong>Nome:</strong> ${reservationData.applicantName}</p>
        <p><strong>Email:</strong> ${reservationData.applicantEmail}</p>
        <p><strong>Instituição:</strong> ${reservationData.applicantInstitution || 'Não informada'}</p>
        
        <h3 style="color: #333;">Dados da Solicitação</h3>
        <p><strong>Tipo(s) de Análise:</strong> ${analysisList}</p>
        <p><strong>Tipo de Amostra:</strong> ${reservationData.sampleType || 'Não especificado'}</p>
        <p><strong>Número de Amostras:</strong> ${reservationData.numberOfSamples}</p>
        <p><strong>Descrição:</strong> ${reservationData.sampleDescription || 'Não informada'}</p>
        <p><strong>Finalidade:</strong> ${reservationData.purpose}</p>
        
        <h3 style="color: #333;">Informações Adicionais</h3>
        <p><strong>Protocolo:</strong> ${reservation.id}</p>
        <p><strong>Data da Solicitação:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        
        <hr style="border: 0.5px solid #ccc;" />
        <p style="color: #666; font-size: 12px;">
          Laboratório de Espectrometria de Massas de Alta Resolução - LEMAR/CPGG/UFBA<br/>
          Campus Universitário de Ondina - Salvador/BA
        </p>
      </div>
    `

    console.log(`📧 Enviando email para o chefe do LEMAR: ${chiefEmail}`)
    
    const emailResult = await sendEmail({
      to: chiefEmail,
      subject: `Nova Solicitação de Análise LEMAR - ${reservationData.applicantName}`,
      html: emailHtml,
      replyTo: reservationData.applicantEmail,
    })

    if (!emailResult.success) {
      console.error('❌ Erro ao enviar email:', emailResult.error)
      throw new Error(`Falha ao enviar email: ${emailResult.error}`)
    }
    
    console.log('✅ Email enviado com sucesso para o chefe do LEMAR')

    return new Response(
      JSON.stringify({ 
        success: true, 
        reservationId: reservation.id,
        message: 'Solicitação enviada com sucesso!' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )

  } catch (error) {
    console.error('Erro na função send-lemar-reservation:', error)
    
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
}

serve(handler)
