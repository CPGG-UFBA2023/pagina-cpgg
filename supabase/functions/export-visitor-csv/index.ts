import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

interface VisitorLocation {
  id: string
  city: string
  country: string
  latitude: number
  longitude: number
  visitor_count: number
  unique_ip_hashes: string[] | null
  created_at: string
  updated_at: string
}

function csvEscape(value: string | number | null): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('visitor_locations')
      .select('id, city, country, latitude, longitude, visitor_count, unique_ip_hashes, created_at, updated_at')
      .order('visitor_count', { ascending: false })

    if (error) {
      console.error('Error fetching visitor locations:', error)
      throw error
    }

    const rows = (data || []) as VisitorLocation[]

    const headers = ['id', 'city', 'country', 'latitude', 'longitude', 'visitor_count', 'unique_ip_hashes_count', 'created_at', 'updated_at']
    const csvLines = [
      headers.join(','),
      ...rows.map((row) => [
        csvEscape(row.id),
        csvEscape(row.city),
        csvEscape(row.country),
        csvEscape(row.latitude),
        csvEscape(row.longitude),
        csvEscape(row.visitor_count),
        csvEscape(row.unique_ip_hashes?.length || 0),
        csvEscape(row.created_at),
        csvEscape(row.updated_at),
      ].join(',')),
    ]

    const csv = csvLines.join('\n')
    const total = rows.reduce((sum, row) => sum + (row.visitor_count || 0), 0)

    console.log(`Exported ${rows.length} locations with ${total} visitors`)

    let body: any
    try {
      body = await req.json()
    } catch (_) {
      body = {}
    }

    const sendTo = body?.email || Deno.env.get('SMTP_USER')

    if (sendTo) {
      try {
        const smtpHost = Deno.env.get('SMTP_HOST')
        const smtpPort = Deno.env.get('SMTP_PORT')
        const smtpUser = Deno.env.get('SMTP_USER')
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')

        if (smtpHost && smtpPort && smtpUser && smtpPassword) {
          const port = parseInt(smtpPort)
          const useTls = port === 465

          const client = new SMTPClient({
            connection: {
              hostname: smtpHost,
              port: port,
              tls: useTls,
              auth: {
                username: smtpUser,
                password: smtpPassword,
              },
            },
          })

          await client.send({
            from: `CPGG UFBA <${smtpUser}>`,
            to: [sendTo],
            subject: 'Exportacao de visitantes - CPGG',
            content: `Segue em anexo o export de ${rows.length} localizacoes e ${total} visitantes do site CPGG.`,
            html: `<p>Segue em anexo o export de <strong>${rows.length}</strong> localizações e <strong>${total}</strong> visitantes do site CPGG.</p>`,
            attachments: [{
              filename: 'visitantes-cpgg.csv',
              content: encodeBase64(csv),
              encoding: 'base64',
              contentType: 'text/csv; charset=utf-8',
            }],
          })

          await client.close()
          console.log(`CSV emailed to ${sendTo}`)

          return new Response(
            JSON.stringify({ success: true, message: `CSV enviado para ${sendTo}`, locations: rows.length, visitors: total }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError)
      }
    }

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="visitantes-cpgg.csv"',
      },
      status: 200,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in export-visitor-csv:', error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

