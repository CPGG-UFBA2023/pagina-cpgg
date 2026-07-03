import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3'
import { sendEmail } from "../_shared/smtp-client.ts"
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LaigaReservationRequest {
  selectedEquipments: string[]
  otherEquipment: string
  peripherals: string
  withdrawalDate: string
  returnDate: string
  purpose: string
  applicantName: string
  applicantEmail: string
  agreementAccepted: boolean
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    console.log('Iniciando processamento da solicitação LAIGA...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const reservationData: LaigaReservationRequest = await req.json()
    console.log('Dados recebidos:', JSON.stringify(reservationData, null, 2))

    // Salvar no banco de dados (adaptando a tabela existente)
    console.log('Salvando no banco de dados...')
    const { data: reservation, error: dbError } = await supabase
      .from('reservations')
      .insert({
        nome: reservationData.applicantName,
        sobrenome: '', // Campo obrigatório mas não usado neste formulário
        email: reservationData.applicantEmail,
        uso: `${reservationData.purpose} - Equipamentos: ${reservationData.selectedEquipments.join(', ')}${reservationData.otherEquipment ? `, ${reservationData.otherEquipment}` : ''}`,
        inicio: new Date(reservationData.withdrawalDate).toISOString(),
        termino: new Date(reservationData.returnDate).toISOString(),
        tipo_reserva: 'laiga_equipments'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Erro no banco de dados:', dbError)
      throw new Error(`Erro no banco de dados: ${dbError.message}`)
    }

    console.log('Reserva salva com sucesso:', reservation.id)

    // Buscar email do chefe do LAIGA
    console.log('Buscando informações do laboratório LAIGA...')
    const { data: labData, error: labError } = await supabase
      .from('laboratories')
      .select('chief_alternative_email, chief_name')
      .eq('acronym', 'LAIGA')
      .single()

    if (labError) {
      console.error('Erro ao buscar dados do laboratório:', labError)
    }

    const chiefEmail = labData?.chief_alternative_email || 'marquinhos.arv@gmail.com'
    const chiefName = labData?.chief_name || 'Prof. Marcos Alberto Rodrigues Vasconcelos'
    
    console.log('Email do chefe encontrado:', chiefEmail)

    // Preparar conteúdo do email
    const equipmentsList = reservationData.selectedEquipments.length > 0 
      ? reservationData.selectedEquipments.join(', ')
      : 'Nenhum equipamento da lista selecionado'

    const formattedWithdrawalDate = new Date(reservationData.withdrawalDate).toLocaleDateString('pt-BR')
    const formattedReturnDate = new Date(reservationData.returnDate).toLocaleDateString('pt-BR')

    const emailText = buildReservationEmailText(
      reservationData,
      reservation.id,
      equipmentsList,
      formattedWithdrawalDate,
      formattedReturnDate
    )

    // Gerar PDF do comprovante
    console.log('📄 Gerando PDF do comprovante...')
    const pdfContent = await generatePDFContent(
      reservationData,
      reservation.id,
      equipmentsList,
      formattedWithdrawalDate,
      formattedReturnDate
    )
    console.log('✅ PDF gerado com sucesso')

    // Enviar email via SMTP
    console.log(`📧 Enviando email EXCLUSIVAMENTE para o chefe do LAIGA: ${chiefEmail}`)
    
    const emailResult = await sendEmail({
      to: chiefEmail,
      subject: `Nova Solicitação de Equipamentos LAIGA - ${reservationData.applicantName}`,
      text: emailText,
      plainTextOnly: true,
      replyTo: reservationData.applicantEmail,
      attachments: [
        {
          filename: `Comprovante_LAIGA_${reservation.id.substring(0, 8)}.pdf`,
          content: pdfContent,
        },
      ],
    })

    if (!emailResult.success) {
      console.error('❌ Erro ao enviar email para o chefe do LAIGA:', emailResult.error)
      throw new Error(`Falha ao enviar email: ${emailResult.error}`)
    }
    
    console.log('✅ Email enviado com sucesso para o chefe do LAIGA')

    return new Response(
      JSON.stringify({ 
        success: true, 
        reservationId: reservation.id,
        message: 'Solicitação enviada com sucesso!' 
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    )

  } catch (error: any) {
    console.error('Erro na função send-laiga-reservation:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    )
  }
}

function buildReservationEmailText(
  reservationData: LaigaReservationRequest,
  reservationId: string,
  equipmentsList: string,
  withdrawalDate: string,
  returnDate: string
): string {
  return [
    'Nova Solicitacao de Reserva de Equipamentos - LAIGA',
    'Laboratorio Integrado de Geofisica Aplicada - LAIGA',
    '',
    'Dados do Solicitante',
    `Nome: ${reservationData.applicantName}`,
    `Email: ${reservationData.applicantEmail}`,
    '',
    'Equipamentos Solicitados',
    `Da lista: ${equipmentsList}`,
    reservationData.otherEquipment ? `Outros equipamentos: ${reservationData.otherEquipment}` : '',
    reservationData.peripherals ? `Perifericos adicionais: ${reservationData.peripherals}` : '',
    '',
    'Periodo de Uso',
    `Data de Retirada: ${withdrawalDate}`,
    `Data de Devolucao: ${returnDate}`,
    '',
    'Finalidade',
    reservationData.purpose,
    '',
    'Termos aceitos',
    '- O solicitante concordou em expressar agradecimentos ao LAIGA/CPGG nos trabalhos apresentados.',
    '- O solicitante concordou em reportar problemas ou avarias no ato da devolucao.',
    '',
    `Protocolo: ${reservationId}`,
    `Data da Solicitacao: ${new Date().toLocaleString('pt-BR')}`,
    '',
    'Em anexo segue o comprovante de solicitacao em PDF.',
  ].filter(Boolean).join('\n')
}

// Função auxiliar para gerar o PDF real
async function generatePDFContent(
  reservationData: LaigaReservationRequest,
  reservationId: string,
  equipmentsList: string,
  withdrawalDate: string,
  returnDate: string
): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { height } = page.getSize()
  
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  const purple = rgb(0.35, 0.17, 0.73) // #592cbb
  const black = rgb(0, 0, 0)
  const gray = rgb(0.4, 0.4, 0.4)
  
  let y = height - 50
  const leftMargin = 50
  const lineHeight = 18
  
  // Header
  page.drawText('COMPROVANTE DE SOLICITAÇÃO', {
    x: 150,
    y,
    size: 16,
    font: helveticaBold,
    color: purple,
  })
  y -= 25
  
  page.drawText('Laboratório Integrado de Geofísica Aplicada - LAIGA', {
    x: 130,
    y,
    size: 11,
    font: helvetica,
    color: gray,
  })
  y -= 18
  
  page.drawText('Centro de Pesquisa em Geofísica e Geologia - CPGG/UFBA', {
    x: 120,
    y,
    size: 11,
    font: helvetica,
    color: gray,
  })
  y -= 30
  
  // Line separator
  page.drawLine({
    start: { x: leftMargin, y },
    end: { x: 545, y },
    thickness: 2,
    color: purple,
  })
  y -= 30
  
  // Section: Dados do Solicitante
  page.drawText('Dados do Solicitante', {
    x: leftMargin,
    y,
    size: 12,
    font: helveticaBold,
    color: purple,
  })
  y -= lineHeight
  
  page.drawText(`Nome: ${reservationData.applicantName}`, {
    x: leftMargin,
    y,
    size: 10,
    font: helvetica,
    color: black,
  })
  y -= lineHeight
  
  page.drawText(`Email: ${reservationData.applicantEmail}`, {
    x: leftMargin,
    y,
    size: 10,
    font: helvetica,
    color: black,
  })
  y -= 25
  
  // Section: Dados da Reserva
  page.drawText('Dados da Reserva', {
    x: leftMargin,
    y,
    size: 12,
    font: helveticaBold,
    color: purple,
  })
  y -= lineHeight
  
  const maxWidth = 495
  const drawWrapped = (text: string) => {
    const paragraphs = String(text).split(/\r?\n/)
    for (const para of paragraphs) {
      const words = para.split(/\s+/).filter(Boolean)
      if (words.length === 0) {
        y -= lineHeight
        continue
      }
      let line = ''
      for (const word of words) {
        const test = line ? `${line} ${word}` : word
        const w = helvetica.widthOfTextAtSize(test, 10)
        if (w > maxWidth && line) {
          page.drawText(line, { x: leftMargin, y, size: 10, font: helvetica, color: black })
          y -= lineHeight
          line = word
        } else {
          line = test
        }
      }
      if (line) {
        page.drawText(line, { x: leftMargin, y, size: 10, font: helvetica, color: black })
        y -= lineHeight
      }
    }
  }

  drawWrapped(`Equipamentos da lista: ${equipmentsList}`)

  if (reservationData.otherEquipment) {
    drawWrapped(`Outros equipamentos: ${reservationData.otherEquipment}`)
  }

  if (reservationData.peripherals) {
    drawWrapped(`Periféricos: ${reservationData.peripherals}`)
  }

  drawWrapped(`Data de Retirada: ${withdrawalDate}`)
  drawWrapped(`Data de Devolução: ${returnDate}`)
  drawWrapped(`Finalidade: ${reservationData.purpose}`)
  drawWrapped('Status: Aguardando aprovação')
  y -= 7
  
  // Section: Informações Adicionais
  page.drawText('Informações Adicionais', {
    x: leftMargin,
    y,
    size: 12,
    font: helveticaBold,
    color: purple,
  })
  y -= lineHeight
  
  page.drawText(`Protocolo: ${reservationId}`, {
    x: leftMargin,
    y,
    size: 10,
    font: helvetica,
    color: black,
  })
  y -= lineHeight
  
  page.drawText(`Data da Solicitação: ${new Date().toLocaleDateString('pt-BR')}`, {
    x: leftMargin,
    y,
    size: 10,
    font: helvetica,
    color: black,
  })
  y -= 30
  
  // Section: Relatório de Uso
  page.drawText('Relatório de Uso do Equipamento', {
    x: leftMargin,
    y,
    size: 12,
    font: helveticaBold,
    color: purple,
  })
  y -= lineHeight
  
  page.drawText('O equipamento apresentou algum problema durante o uso?', {
    x: leftMargin,
    y,
    size: 10,
    font: helveticaBold,
    color: black,
  })
  y -= 15
  
  // Lines for response
  for (let i = 0; i < 5; i++) {
    page.drawLine({
      start: { x: leftMargin, y },
      end: { x: 545, y },
      thickness: 0.5,
      color: gray,
    })
    y -= 20
  }
  y -= 30
  
  // Signatures section
  const signatureY = y - 50
  
  // Left signature
  page.drawLine({
    start: { x: leftMargin, y: signatureY },
    end: { x: 250, y: signatureY },
    thickness: 1,
    color: black,
  })
  page.drawText('Assinatura do solicitante', {
    x: leftMargin + 40,
    y: signatureY - 15,
    size: 10,
    font: helveticaBold,
    color: black,
  })
  page.drawText(reservationData.applicantName, {
    x: leftMargin + 50,
    y: signatureY - 28,
    size: 9,
    font: helvetica,
    color: gray,
  })
  
  // Right signature
  page.drawLine({
    start: { x: 320, y: signatureY },
    end: { x: 545, y: signatureY },
    thickness: 1,
    color: black,
  })
  page.drawText('Assinatura do técnico ou responsável', {
    x: 340,
    y: signatureY - 15,
    size: 10,
    font: helveticaBold,
    color: black,
  })
  page.drawText('pela retirada', {
    x: 385,
    y: signatureY - 28,
    size: 10,
    font: helveticaBold,
    color: black,
  })
  
  // Footer
  const footerY = 60
  page.drawLine({
    start: { x: leftMargin, y: footerY + 20 },
    end: { x: 545, y: footerY + 20 },
    thickness: 0.5,
    color: gray,
  })
  
  page.drawText('Laboratório Integrado de Geofísica Aplicada - LAIGA/CPGG/UFBA', {
    x: 140,
    y: footerY,
    size: 9,
    font: helvetica,
    color: gray,
  })
  page.drawText('Campus Universitário de Ondina - Salvador/BA', {
    x: 175,
    y: footerY - 12,
    size: 9,
    font: helvetica,
    color: gray,
  })
  
  const pdfBytes = await pdfDoc.save()
  
  // Convert to base64
  const base64 = btoa(String.fromCharCode(...pdfBytes))
  return base64
}

serve(handler)
