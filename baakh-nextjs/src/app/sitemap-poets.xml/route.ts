import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baakh.com'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Fetch poets with their details
    const { data: poets, error } = await supabase
      .from('poets')
      .select(`
        poet_slug,
        sindhi_name,
        english_name,
        updated_at,
        created_at,
        is_featured
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching poets:', error)
      return new NextResponse('Error fetching poets', { status: 500 })
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`

    // Add poets listing pages
    sitemap += `
  <url>
    <loc>${baseUrl}/sd/poets</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/en/poets</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`

    // Add individual poet pages
    if (poets) {
      poets.forEach(poet => {
        const lastmod = poet.updated_at || poet.created_at || new Date().toISOString()
        const priority = poet.is_featured ? '0.9' : '0.8'
        
        sitemap += `
  <url>
    <loc>${baseUrl}/sd/poets/${poet.poet_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/poets/${poet.poet_slug}/image</image:loc>
      <image:title>${poet.sindhi_name || poet.english_name}</image:title>
      <image:caption>${poet.sindhi_name || ''} - ${poet.english_name || ''}</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/en/poets/${poet.poet_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/poets/${poet.poet_slug}/image</image:loc>
      <image:title>${poet.english_name || poet.sindhi_name}</image:title>
      <image:caption>${poet.english_name || ''} - ${poet.sindhi_name || ''}</image:caption>
    </image:image>
  </url>`
      })
    }

    sitemap += `
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Error generating poets sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
