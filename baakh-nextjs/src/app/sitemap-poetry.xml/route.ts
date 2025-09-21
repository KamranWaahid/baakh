import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baakh.com'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Fetch poetry works with pagination
    const { data: poetry, error } = await supabase
      .from('poetry_main')
      .select(`
        poetry_slug,
        updated_at,
        created_at,
        is_featured,
        poets!inner(poet_slug, sindhi_name, english_name),
        categories!inner(slug),
        poetry_translations!inner(title, lang)
      `)
      .eq('visibility', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1000) // Limit to prevent memory issues

    if (error) {
      console.error('Error fetching poetry:', error)
      return new NextResponse('Error fetching poetry', { status: 500 })
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`

    // Add poetry listing pages
    sitemap += `
  <url>
    <loc>${baseUrl}/sd/poetry</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/en/poetry</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`

    // Add individual poetry pages
    if (poetry) {
      poetry.forEach(poem => {
        const lastmod = poem.updated_at || poem.created_at || new Date().toISOString()
        const priority = poem.is_featured ? '0.9' : '0.7'
        const poetSlug = (poem as { poets?: { poet_slug?: string } }).poets?.poet_slug
        const categorySlug = (poem as { categories?: { slug?: string } }).categories?.slug
        const translations = (poem as { poetry_translations?: Array<{ lang: string; title: string }> }).poetry_translations || []
        const sindhiTitle = translations.find((t: { lang: string; title: string }) => t.lang === 'sd')?.title
        const englishTitle = translations.find((t: { lang: string; title: string }) => t.lang === 'en')?.title
        
        if (poetSlug && categorySlug) {
          sitemap += `
  <url>
    <loc>${baseUrl}/sd/poetry/${poem.poetry_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/poetry/${poem.poetry_slug}/image</image:loc>
      <image:title>${sindhiTitle || englishTitle || 'Poetry'}</image:title>
      <image:caption>${sindhiTitle || ''} by ${(poem as { poets?: { sindhi_name?: string; english_name?: string } }).poets?.sindhi_name || (poem as { poets?: { sindhi_name?: string; english_name?: string } }).poets?.english_name || ''}</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/en/poetry/${poem.poetry_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/poetry/${poem.poetry_slug}/image</image:loc>
      <image:title>${englishTitle || sindhiTitle || 'Poetry'}</image:title>
      <image:caption>${englishTitle || ''} by ${(poem as { poets?: { sindhi_name?: string; english_name?: string } }).poets?.english_name || (poem as { poets?: { sindhi_name?: string; english_name?: string } }).poets?.sindhi_name || ''}</image:caption>
    </image:image>
  </url>`
        }
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
    console.error('Error generating poetry sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
