export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baakh.com'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Fetch categories with their details
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        slug,
        updated_at,
        created_at,
        category_details!inner(cat_name, cat_name_plural, cat_detail, lang)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching categories:', error)
      return new NextResponse('Error fetching categories', { status: 500 })
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`

    // Add categories listing pages
    sitemap += `
  <url>
    <loc>${baseUrl}/sd/categories</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/en/categories</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`

    // Add individual category pages
    if (categories) {
      categories.forEach((category: any) => {
        const lastmod = category.updated_at || category.created_at || new Date().toISOString()
        const priority = '0.7'
        const details = (category as any).category_details || []
        const sindhiName = details.find((d: any) => d.lang === 'sd')?.cat_name
        const englishName = details.find((d: any) => d.lang === 'en')?.cat_name
        const sindhiDetail = details.find((d: any) => d.lang === 'sd')?.cat_detail
        const englishDetail = details.find((d: any) => d.lang === 'en')?.cat_detail
        
        sitemap += `
  <url>
    <loc>${baseUrl}/sd/categories/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/categories/${category.slug}/image</image:loc>
      <image:title>${sindhiName || englishName || 'Category'}</image:title>
      <image:caption>${sindhiDetail || englishDetail || `Poetry in ${category.slug} style`}</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/en/categories/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/categories/${category.slug}/image</image:loc>
      <image:title>${englishName || sindhiName || 'Category'}</image:title>
      <image:caption>${englishDetail || sindhiDetail || `Poetry in ${category.slug} style`}</image:caption>
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
    console.error('Error generating categories sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
