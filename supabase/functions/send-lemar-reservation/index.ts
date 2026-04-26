import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3'
import { sendEmail } from "../_shared/smtp-client.ts"
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

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

    // Gerar PDF
    console.log('📄 Gerando PDF do comprovante...')
    const pdfContent = await generatePDFContent(reservationData, reservation.id, analysisList)
    console.log('✅ PDF gerado com sucesso')

    // Gerar HTML do email
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
        <p style="color: #666; font-size: 12px;"><em>O PDF com os detalhes da solicitação segue em anexo.</em></p>
      </div>
    `

    console.log(`📧 Enviando email para o chefe do LEMAR: ${chiefEmail}`)
    
    const emailResult = await sendEmail({
      to: chiefEmail,
      subject: `Nova Solicitação de Análise LEMAR - ${reservationData.applicantName}`,
      html: emailHtml,
      replyTo: reservationData.applicantEmail,
      attachments: [
        {
          filename: `Comprovante_LEMAR_${reservation.id.substring(0, 8)}.pdf`,
          content: pdfContent,
        },
      ],
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
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Erro na função send-lemar-reservation:', error)
    
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
}

async function generatePDFContent(
  reservationData: LemarReservationRequest,
  reservationId: string,
  analysisList: string
): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { height } = page.getSize()
  
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  const purple = rgb(0.35, 0.17, 0.73)
  const black = rgb(0, 0, 0)
  const gray = rgb(0.4, 0.4, 0.4)
  
  let y = height - 50
  const leftMargin = 50
  const lineHeight = 18
  
  // Header
  page.drawText('COMPROVANTE DE SOLICITAÇÃO DE ANÁLISE', {
    x: 120, y, size: 16, font: helveticaBold, color: purple,
  })
  y -= 25
  
  page.drawText('Laboratório de Espectrometria de Massas de Alta Resolução - LEMAR', {
    x: 85, y, size: 11, font: helvetica, color: gray,
  })
  y -= 18
  
  page.drawText('Centro de Pesquisa em Geofísica e Geologia - CPGG/UFBA', {
    x: 120, y, size: 11, font: helvetica, color: gray,
  })
  y -= 30
  
  // Line separator
  page.drawLine({
    start: { x: leftMargin, y }, end: { x: 545, y }, thickness: 2, color: purple,
  })
  y -= 30
  
  // Section: Dados do Solicitante
  page.drawText('Dados do Solicitante', {
    x: leftMargin, y, size: 12, font: helveticaBold, color: purple,
  })
  y -= lineHeight
  
  page.drawText(`Nome: ${reservationData.applicantName}`, {
    x: leftMargin, y, size: 10, font: helvetica, color: black,
  })
  y -= lineHeight
  
  page.drawText(`Email: ${reservationData.applicantEmail}`, {
    x: leftMargin, y, size: 10, font: helvetica, color: black,
  })
  y -= lineHeight
  
  page.drawText(`Instituição: ${reservationData.applicantInstitution || 'Não informada'}`, {
    x: leftMargin, y, size: 10, font: helvetica, color: black,
  })
  y -= 25
  
  // Section: Dados da Análise
  page.drawText('Dados da Análise Solicitada', {
    x: leftMargin, y, size: 12, font: helveticaBold, color: purple,
  })
  y -= lineHeight
  
  // Handle long analysis list with wrapping
  const analysisLines = wrapText(`Tipo(s) de Análise: ${analysisList}`, 80)
  for (const line of analysisLines) {
    page.drawText(line, {
      x: leftMargin, y, size: 10, font: helvetica, color: black,
    })
    y -= lineHeight
  }
  
  page.drawText(`Tipo de Amostra: ${reservationData.sampleType || 'Não especificado'}`, {
    x: leftMargin, y, size: 10, font: helvetica, color: black,
  })
  y -= lineHeight
  
  page.drawText(`Número de Amostras: ${reservationData.numberOfSamples}`, {
    x: leftMargin, y, size: 10, font: helvetica, color: black,
  })
  y -= lineHeight
  
  if (reservationData.sampleDescription) {
    const descLines = wrapText(`Descrição: ${reservationData.sampleDescription}`, 80)
    for (const line of descLines) {
      page.drawText(line, {
        x: leftMargin, y, size: 10, font: helvetica, color: black,
      })
      y -= lineHeight
    }
  }
  
  page.drawText(`Finalidade: ${reservationData.purpose}`, {
    x: leftMargin, y, size: 10, font: helvetica, color: black,
  })
  y -= lineHeight
  
  page.drawText('Status: Aguardando aprovação', {
    x: leftMargin, y, size: 10, font: helvetica, color: black,
  })
  y -= 25
  
  // Section: Informações Adicionais
  page.drawText('Informações Adicionais', {
    x: leftMargin, y, size: 12, font: helveticaBold, color: purple,
  })
  y -= lineHeight
  
  page.drawText(`Protocolo: ${reservationId}`, {
    x: leftMargin, y, size: 10, font: helvetica, color: black,
  })
  y -= lineHeight
  
  page.drawText(`Data da Solicitação: ${new Date().toLocaleDateString('pt-BR')}`, {
    x: leftMargin, y, size: 10, font: helvetica, color: black,
  })
  y -= 30
  
  // Section: Observações do Laboratório
  page.drawText('Observações do Laboratório', {
    x: leftMargin, y, size: 12, font: helveticaBold, color: purple,
  })
  y -= lineHeight
  
  page.drawText('Anotações sobre as medidas realizadas:', {
    x: leftMargin, y, size: 10, font: helveticaBold, color: black,
  })
  y -= 15
  
  for (let i = 0; i < 5; i++) {
    page.drawLine({
      start: { x: leftMargin, y }, end: { x: 545, y }, thickness: 0.5, color: gray,
    })
    y -= 20
  }
  y -= 30
  
  // Signatures
  const signatureY = y - 30
  
  page.drawLine({
    start: { x: leftMargin, y: signatureY }, end: { x: 250, y: signatureY }, thickness: 1, color: black,
  })
  page.drawText('Assinatura do solicitante', {
    x: leftMargin + 40, y: signatureY - 15, size: 10, font: helveticaBold, color: black,
  })
  page.drawText(reservationData.applicantName, {
    x: leftMargin + 50, y: signatureY - 28, size: 9, font: helvetica, color: gray,
  })
  
  page.drawLine({
    start: { x: 320, y: signatureY }, end: { x: 545, y: signatureY }, thickness: 1, color: black,
  })
  page.drawText('Assinatura do responsável', {
    x: 355, y: signatureY - 15, size: 10, font: helveticaBold, color: black,
  })
  page.drawText('pelo laboratório', {
    x: 375, y: signatureY - 28, size: 10, font: helveticaBold, color: black,
  })
  
  // Footer
  const footerY = 60
  page.drawLine({
    start: { x: leftMargin, y: footerY + 20 }, end: { x: 545, y: footerY + 20 }, thickness: 0.5, color: gray,
  })
  
  page.drawText('Laboratório de Espectrometria de Massas de Alta Resolução - LEMAR/CPGG/UFBA', {
    x: 95, y: footerY, size: 9, font: helvetica, color: gray,
  })
  page.drawText('Campus Universitário de Ondina - Salvador/BA', {
    x: 175, y: footerY - 12, size: 9, font: helvetica, color: gray,
  })
  
  const pdfBytes = await pdfDoc.save()
  const base64 = btoa(String.fromCharCode(...pdfBytes))
  return base64
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim()
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

serve(handler)
