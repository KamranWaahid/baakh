import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baakh.com'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Fetch couplets with their details
    const { data: couplets, error } = await supabase
      .from('poetry_couplets')
      .select(`
        couplet_slug,
        couplet_text,
        updated_at,
        created_at,
        poets!inner(poet_slug, sindhi_name, english_name)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1000) // Limit to prevent memory issues

    if (error) {
      console.error('Error fetching couplets:', error)
      return new NextResponse('Error fetching couplets', { status: 500 })
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`

    // Add couplets listing pages
    sitemap += `
  <url>
    <loc>${baseUrl}/sd/couplets</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/en/couplets</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`

    // Add individual couplet pages
    if (couplets) {
      couplets.forEach((couplet: any) => {
        const lastmod = couplet.updated_at || couplet.created_at || new Date().toISOString()
        const priority = '0.6'
        const poetSlug = (couplet as any).poets?.poet_slug
        const poetName = (couplet as any).poets?.sindhi_name || (couplet as any).poets?.english_name || 'Unknown Poet'
        
        sitemap += `
  <url>
    <loc>${baseUrl}/sd/couplets/${couplet.couplet_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/couplets/${couplet.couplet_slug}/image</image:loc>
      <image:title>${couplet.couplet_text?.substring(0, 50) || 'Couplet'}</image:title>
      <image:caption>${couplet.couplet_text?.substring(0, 100) || ''} by ${poetName}</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/en/couplets/${couplet.couplet_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/couplets/${couplet.couplet_slug}/image</image:loc>
      <image:title>${couplet.couplet_text?.substring(0, 50) || 'Couplet'}</image:title>
      <image:caption>${couplet.couplet_text?.substring(0, 100) || ''} by ${poetName}</image:caption>
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
    console.error('Error generating couplets sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
