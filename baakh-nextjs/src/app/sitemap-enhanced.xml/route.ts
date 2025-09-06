import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generatePoetDescription, generatePoetryDescription, generateCategoryDescription, generateAISearchContext } from '@/lib/seo-utils'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baakh.com'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Fetch comprehensive data for AEO optimization
    const [poetsResult, categoriesResult, topicsResult, poetryResult] = await Promise.all([
      supabase
        .from('poets')
        .select(`
          poet_slug,
          sindhi_name,
          english_name,
          sindhi_laqab,
          english_laqab,
          sindhi_tagline,
          english_tagline,
          updated_at,
          created_at,
          is_featured
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('categories')
        .select(`
          slug,
          updated_at,
          created_at,
          category_details!inner(cat_name, cat_name_plural, cat_detail, lang)
        `)
        .is('deleted_at', null),
      
      supabase
        .from('tags')
        .select(`
          slug,
          label,
          updated_at,
          created_at,
          tags_translations!inner(title, detail, lang_code)
        `)
        .eq('tag_type', 'topic')
        .is('deleted_at', null),
      
      supabase
        .from('poetry_main')
        .select(`
          poetry_slug,
          updated_at,
          created_at,
          is_featured,
          poets!inner(poet_slug, sindhi_name, english_name),
          categories!inner(slug),
          poetry_translations!inner(title, info, lang)
        `)
        .eq('visibility', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(500) // Limit for performance
    ])

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`

    // Home pages with high priority
    sitemap += `
  <url>
    <loc>${baseUrl}/sd</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og-image?title=Sindhi Poetry Collection</image:loc>
      <image:title>Sindhi Poetry Collection - Baakh</image:title>
      <image:caption>Explore the rich tradition of Sindhi poetry, couplets, and literature</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/en</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og-image?title=Sindhi Poetry Collection</image:loc>
      <image:title>Sindhi Poetry Collection - Baakh</image:title>
      <image:caption>Explore the rich tradition of Sindhi poetry, couplets, and literature</image:caption>
    </image:image>
  </url>`

    // Featured poets with enhanced metadata and AI optimization
    if (poetsResult.data) {
      poetsResult.data.forEach(poet => {
        const lastmod = poet.updated_at || poet.created_at || new Date().toISOString()
        const priority = poet.is_featured ? '0.9' : '0.8'
        const sindhiName = poet.sindhi_name || ''
        const englishName = poet.english_name || ''
        const sindhiLaqab = poet.sindhi_laqab || ''
        const englishLaqab = poet.english_laqab || ''
        
        // Generate AI-optimized descriptions
        const sindhiDescription = generatePoetDescription(poet, 'sd')
        const englishDescription = generatePoetDescription(poet, 'en')
        
        sitemap += `
  <url>
    <loc>${baseUrl}/sd/poets/${poet.poet_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/poets/${poet.poet_slug}/image</image:loc>
      <image:title>${sindhiName} ${sindhiLaqab ? `(${sindhiLaqab})` : ''}</image:title>
      <image:caption>${sindhiDescription.substring(0, 200)}...</image:caption>
    </image:image>
    <news:news>
      <news:publication>
        <news:name>باکھ - سنڌي شاعري</news:name>
        <news:language>sd</news:language>
      </news:publication>
      <news:publication_date>${lastmod}</news:publication_date>
      <news:title>${sindhiName} - سنڌي شاعر</news:title>
      <news:keywords>سنڌي شاعري, سنڌي ادب, شعر, نظم, غزل</news:keywords>
    </news:news>
  </url>
  <url>
    <loc>${baseUrl}/en/poets/${poet.poet_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/poets/${poet.poet_slug}/image</image:loc>
      <image:title>${englishName} ${englishLaqab ? `(${englishLaqab})` : ''}</image:title>
      <image:caption>${englishDescription.substring(0, 200)}...</image:caption>
    </image:image>
    <news:news>
      <news:publication>
        <news:name>Baakh - Sindhi Poetry</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${lastmod}</news:publication_date>
      <news:title>${englishName} - Sindhi Poet</news:title>
      <news:keywords>Sindhi poetry, Sindhi literature, couplets, nazam, ghazal</news:keywords>
    </news:news>
  </url>`
      })
    }

    // Categories with rich metadata
    if (categoriesResult.data) {
      categoriesResult.data.forEach(category => {
        const lastmod = category.updated_at || category.created_at || new Date().toISOString()
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
    <priority>0.7</priority>
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
    <priority>0.7</priority>
    <image:image>
      <image:loc>${baseUrl}/api/categories/${category.slug}/image</image:loc>
      <image:title>${englishName || sindhiName || 'Category'}</image:title>
      <image:caption>${englishDetail || sindhiDetail || `Poetry in ${category.slug} style`}</image:caption>
    </image:image>
  </url>`
      })
    }

    // Topics with enhanced descriptions
    if (topicsResult.data) {
      topicsResult.data.forEach(topic => {
        const lastmod = topic.updated_at || topic.created_at || new Date().toISOString()
        const translations = (topic as any).tags_translations || []
        const sindhiTitle = translations.find((t: any) => t.lang_code === 'sd')?.title
        const englishTitle = translations.find((t: any) => t.lang_code === 'en')?.title
        const sindhiDetail = translations.find((t: any) => t.lang_code === 'sd')?.detail
        const englishDetail = translations.find((t: any) => t.lang_code === 'en')?.detail
        
        sitemap += `
  <url>
    <loc>${baseUrl}/sd/topic/${topic.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${baseUrl}/api/topics/${topic.slug}/image</image:loc>
      <image:title>${sindhiTitle || englishTitle || topic.label}</image:title>
      <image:caption>${sindhiDetail || englishDetail || `Explore poetry about ${topic.label}`}</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/en/topic/${topic.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${baseUrl}/api/topics/${topic.slug}/image</image:loc>
      <image:title>${englishTitle || sindhiTitle || topic.label}</image:title>
      <image:caption>${englishDetail || sindhiDetail || `Explore poetry about ${topic.label}`}</image:caption>
    </image:image>
  </url>`
      })
    }

    // Featured poetry works
    if (poetryResult.data) {
      poetryResult.data.forEach(poem => {
        const lastmod = poem.updated_at || poem.created_at || new Date().toISOString()
        const priority = poem.is_featured ? '0.8' : '0.6'
        const poetSlug = (poem as any).poets?.poet_slug
        const categorySlug = (poem as any).categories?.slug
        const translations = (poem as any).poetry_translations || []
        const sindhiTitle = translations.find((t: any) => t.lang === 'sd')?.title
        const englishTitle = translations.find((t: any) => t.lang === 'en')?.title
        const sindhiInfo = translations.find((t: any) => t.lang === 'sd')?.info
        const englishInfo = translations.find((t: any) => t.lang === 'en')?.info
        
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
      <image:caption>${sindhiInfo || englishInfo || `Poetry by ${(poem as any).poets?.sindhi_name || (poem as any).poets?.english_name || ''}`}</image:caption>
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
      <image:caption>${englishInfo || sindhiInfo || `Poetry by ${(poem as any).poets?.english_name || (poem as any).poets?.sindhi_name || ''}`}</image:caption>
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
    console.error('Error generating enhanced sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
