import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.3'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

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
