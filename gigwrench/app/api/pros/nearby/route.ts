import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const category = searchParams.get('category') || ''
    const radiusMiles = parseFloat(searchParams.get('radius') || '25')
    const radiusDeg = radiusMiles / 69

    const supabase = serviceClient()

    let query = supabase
      .from('pro_profiles')
      .select(`
        id,
        bio,
        avg_rating,
        total_reviews,
        total_jobs,
        service_lat,
        service_lng,
        service_radius_miles,
        id_verified,
        profiles!inner(first_name, last_name, avatar_url, language),
        pro_trades(category, subcategory)
      `)
      .eq('profile_active', true)
      .eq('id_verified', true)
      .gte('service_lat', lat - radiusDeg)
      .lte('service_lat', lat + radiusDeg)
      .gte('service_lng', lng - radiusDeg)
      .lte('service_lng', lng + radiusDeg)

    if (category) {
      query = query.eq('pro_trades.category', category)
    }

    const { data: pros, error } = await query.limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = (pros || []).map(pro => {
      const profile = pro.profiles as { first_name: string; last_name: string; avatar_url: string | null; language: string }
      const distanceLat = Math.abs((pro.service_lat || 0) - lat) * 69
      const distanceLng = Math.abs((pro.service_lng || 0) - lng) * 69 * Math.cos(lat * Math.PI / 180)
      const distance = Math.round(Math.sqrt(distanceLat * distanceLat + distanceLng * distanceLng) * 10) / 10

      return {
        id: pro.id,
        name: `${profile.first_name} ${profile.last_name}`,
        avatar_url: profile.avatar_url,
        bio: pro.bio,
        avg_rating: pro.avg_rating,
        total_reviews: pro.total_reviews,
        total_jobs: pro.total_jobs,
        distance_miles: distance,
        id_verified: pro.id_verified,
        trades: pro.pro_trades,
        language: profile.language,
      }
    })

    return NextResponse.json({ pros: results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
