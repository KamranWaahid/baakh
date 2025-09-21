// AI-optimized sitemap for maximum discoverability by AI search engines

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generatePoetDescription, generatePoetryDescription, generateCategoryDescription } from '@/lib/seo-utils'
import { generatePoetryKeywords } from '@/lib/poetry-seo-engine'
import { generatePoetAIContext, generatePoetryAIContext } from '@/lib/ai-search-optimizer'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baakh.com'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Fetch comprehensive data with AI optimization
    const [poetsResult, categoriesResult, topicsResult, poetryResult, coupletsResult] = await Promise.all([
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
          sindhi_details,
          english_details,
          birth_year,
          death_year,
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
          poets!inner(poet_slug, sindhi_name, english_name, birth_year, death_year),
          categories!inner(slug, category_details!inner(cat_name, lang)),
          poetry_translations!inner(title, info, lang)
        `)
        .eq('visibility', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(500),
      
      supabase
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
        .limit(500)
    ])

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:ai="http://www.ai-search.org/schemas/sitemap-ai/1.0">`

    // Home pages with AI optimization
    sitemap += `
  <url>
    <loc>${baseUrl}/sd</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og-image?title=Sindhi Poetry Collection</image:loc>
      <image:title>سنڌي شاعري جو وڏو مجموعو - باک</image:title>
      <image:caption>سنڌي شاعري، شعر، ۽ ادب جو وڏو مجموعو. مشهور سنڌي شاعرن جي شاعري پڙهو.</image:caption>
    </image:image>
    <ai:content_type>literary_website</ai:content_type>
    <ai:language>sindhi</ai:language>
    <ai:cultural_context>sindhi_literature</ai:cultural_context>
    <ai:search_intent>literary_discovery</ai:search_intent>
    <ai:content_quality>high</ai:content_quality>
  </url>
  <url>
    <loc>${baseUrl}/en</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og-image?title=Sindhi Poetry Archive</image:loc>
      <image:title>Sindhi Poetry Collection - Baakh</image:title>
      <image:caption>Comprehensive archive of Sindhi poetry, couplets, and literature. Read works by famous Sindhi poets.</image:caption>
    </image:image>
    <ai:content_type>literary_website</ai:content_type>
    <ai:language>english</ai:language>
    <ai:cultural_context>sindhi_literature</ai:cultural_context>
    <ai:search_intent>literary_discovery</ai:search_intent>
    <ai:content_quality>high</ai:content_quality>
  </url>`

    // AI-optimized poet pages
    if (poetsResult.data) {
      poetsResult.data.forEach((poet: any) => {
        const lastmod = poet.updated_at || poet.created_at || new Date().toISOString()
        const priority = poet.is_featured ? '0.9' : '0.8'
        const sindhiDescription = generatePoetDescription(poet, 'sd')
        const englishDescription = generatePoetDescription(poet, 'en')
        const aiContext = generatePoetAIContext(poet, 'sd')
        
        sitemap += `

  <url>
    <loc>${baseUrl}/sd/poets/${poet.poet_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/poets/${poet.poet_slug}/image</image:loc>
      <image:title>${poet.sindhi_name} ${poet.sindhi_laqab ? `(${poet.sindhi_laqab})` : ''}</image:title>
      <image:caption>${sindhiDescription.substring(0, 200)}...</image:caption>
    </image:image>
    <news:news>
      <news:publication>
        <news:name>باک سنڌي شاعري</news:name>
        <news:language>sd</news:language>
      </news:publication>
      <news:publication_date>${lastmod}</news:publication_date>
      <news:title>${poet.sindhi_name} - سنڌي شاعر</news:title>
      <news:keywords>سنڌي شاعري, سنڌي ادب, شعر, نظم, غزل, ${poet.sindhi_name}</news:keywords>
    </news:news>
    <ai:content_type>poet</ai:content_type>
    <ai:language>sindhi</ai:language>
    <ai:cultural_context>sindhi_literature</ai:cultural_context>
    <ai:literary_period>${aiContext.literary_period}</ai:literary_period>
    <ai:themes>${aiContext.themes.join(', ')}</ai:themes>
    <ai:authority_score>${aiContext.authority_score}</ai:authority_score>
    <ai:content_quality>${aiContext.content_quality}</ai:content_quality>
  </url>
  <url>
    <loc>${baseUrl}/en/poets/${poet.poet_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/poets/${poet.poet_slug}/image</image:loc>
      <image:title>${poet.english_name} ${poet.english_laqab ? `(${poet.english_laqab})` : ''}</image:title>
      <image:caption>${englishDescription.substring(0, 200)}...</image:caption>
    </image:image>
    <news:news>
      <news:publication>
        <news:name>Baakh - Sindhi Poetry</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${lastmod}</news:publication_date>
      <news:title>${poet.english_name} - Sindhi Poet</news:title>
      <news:keywords>Sindhi poetry, Sindhi literature, couplets, nazam, ghazal, ${poet.english_name}</news:keywords>
    </news:news>
    <ai:content_type>poet</ai:content_type>
    <ai:language>english</ai:language>
    <ai:cultural_context>sindhi_literature</ai:cultural_context>
    <ai:literary_period>${aiContext.literary_period}</ai:literary_period>
    <ai:themes>${aiContext.themes.join(', ')}</ai:themes>
    <ai:authority_score>${aiContext.authority_score}</ai:authority_score>
    <ai:content_quality>${aiContext.content_quality}</ai:content_quality>
  </url>`
      })
    }

    // AI-optimized poetry pages
    if (poetryResult.data) {
      poetryResult.data.forEach((poetry: any) => {
        const lastmod = poetry.updated_at || poetry.created_at || new Date().toISOString()
        const priority = poetry.is_featured ? '0.8' : '0.6'
        const poetSlug = (poetry as any).poets?.poet_slug
        const categorySlug = (poetry as any).categories?.slug
        const translations = (poetry as any).poetry_translations || []
        const sindhiTitle = translations.find((t: any) => t.lang === 'sd')?.title
        const englishTitle = translations.find((t: any) => t.lang === 'en')?.title
        const sindhiInfo = translations.find((t: any) => t.lang === 'sd')?.info
        const englishInfo = translations.find((t: any) => t.lang === 'en')?.info
        
        if (poetSlug && categorySlug) {
          const sindhiDescription = generatePoetryDescription({
            ...poetry,
            title: sindhiInfo || poetry.poetry_slug,
            lang: 'sd',
            poet: (poetry as any).poets,
            category: (poetry as any).categories
          }, 'sd')
          const englishDescription = generatePoetryDescription({
            ...poetry,
            title: englishInfo || poetry.poetry_slug,
            lang: 'en',
            poet: (poetry as any).poets,
            category: (poetry as any).categories
          }, 'en')
          const aiContext = generatePoetryAIContext({
            ...poetry,
            poet: (poetry as any).poets,
            category: (poetry as any).categories
          }, 'sd')
          
          sitemap += `
  <url>
    <loc>${baseUrl}/sd/poetry/${poetry.poetry_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/poetry/${poetry.poetry_slug}/image</image:loc>
      <image:title>${sindhiTitle || englishTitle || 'Poetry'}</image:title>
      <image:caption>${sindhiDescription.substring(0, 200)}...</image:caption>
    </image:image>
    <ai:content_type>poetry</ai:content_type>
    <ai:language>sindhi</ai:language>
    <ai:cultural_context>sindhi_literature</ai:cultural_context>
    <ai:genre>${(poetry as any).categories?.category_details?.find((d: any) => d.lang === 'sd')?.cat_name || (poetry as any).categories?.category_details?.find((d: any) => d.lang === 'en')?.cat_name}</ai:genre>
    <ai:author>${(poetry as any).poets?.sindhi_name || (poetry as any).poets?.english_name}</ai:author>
    <ai:themes>${aiContext.themes.join(', ')}</ai:themes>
    <ai:literary_techniques>${aiContext.literary_techniques.join(', ')}</ai:literary_techniques>
    <ai:content_quality>${aiContext.content_quality}</ai:content_quality>
  </url>
  <url>
    <loc>${baseUrl}/en/poetry/${poetry.poetry_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/poetry/${poetry.poetry_slug}/image</image:loc>
      <image:title>${englishTitle || sindhiTitle || 'Poetry'}</image:title>
      <image:caption>${englishDescription.substring(0, 200)}...</image:caption>
    </image:image>
    <ai:content_type>poetry</ai:content_type>
    <ai:language>english</ai:language>
    <ai:cultural_context>sindhi_literature</ai:cultural_context>
    <ai:genre>${(poetry as any).categories?.category_details?.find((d: any) => d.lang === 'en')?.cat_name || (poetry as any).categories?.category_details?.find((d: any) => d.lang === 'sd')?.cat_name}</ai:genre>
    <ai:author>${(poetry as any).poets?.english_name || (poetry as any).poets?.sindhi_name}</ai:author>
    <ai:themes>${aiContext.themes.join(', ')}</ai:themes>
    <ai:literary_techniques>${aiContext.literary_techniques.join(', ')}</ai:literary_techniques>
    <ai:content_quality>${aiContext.content_quality}</ai:content_quality>
  </url>`
        }
      })
    }

    // AI-optimized category pages
    if (categoriesResult.data) {
      categoriesResult.data.forEach((category: any) => {
        const lastmod = category.updated_at || category.created_at || new Date().toISOString()
        const priority = '0.7'
        const details = (category as any).category_details || []
        const sindhiName = details.find((d: any) => d.lang === 'sd')?.cat_name
        const englishName = details.find((d: any) => d.lang === 'en')?.cat_name
        const sindhiDescription = generateCategoryDescription({
          ...category,
          name: sindhiName || englishName || category.slug,
          name_plural: details.find((d: any) => d.lang === 'sd')?.cat_name_plural || details.find((d: any) => d.lang === 'en')?.cat_name_plural || category.slug,
          description: details.find((d: any) => d.lang === 'sd')?.cat_detail || details.find((d: any) => d.lang === 'en')?.cat_detail || `Poetry in ${category.slug} style`,
          lang: 'sd'
        }, 'sd')
        const englishDescription = generateCategoryDescription({
          ...category,
          name: englishName || sindhiName || category.slug,
          name_plural: details.find((d: any) => d.lang === 'en')?.cat_name_plural || details.find((d: any) => d.lang === 'sd')?.cat_name_plural || category.slug,
          description: details.find((d: any) => d.lang === 'en')?.cat_detail || details.find((d: any) => d.lang === 'sd')?.cat_detail || `Poetry in ${category.slug} style`,
          lang: 'en'
        }, 'en')
        
        sitemap += `
  <url>
    <loc>${baseUrl}/sd/categories/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/categories/${category.slug}/image</image:loc>
      <image:title>${sindhiName || englishName || 'Category'}</image:title>
      <image:caption>${sindhiDescription.substring(0, 200)}...</image:caption>
    </image:image>
    <ai:content_type>category</ai:content_type>
    <ai:language>sindhi</ai:language>
    <ai:cultural_context>sindhi_literature</ai:cultural_context>
    <ai:genre>${sindhiName || englishName}</ai:genre>
    <ai:search_intent>categorical_browsing</ai:search_intent>
    <ai:content_quality>high</ai:content_quality>
  </url>
  <url>
    <loc>${baseUrl}/en/categories/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${baseUrl}/api/categories/${category.slug}/image</image:loc>
      <image:title>${englishName || sindhiName || 'Category'}</image:title>
      <image:caption>${englishDescription.substring(0, 200)}...</image:caption>
    </image:image>
    <ai:content_type>category</ai:content_type>
    <ai:language>english</ai:language>
    <ai:cultural_context>sindhi_literature</ai:cultural_context>
    <ai:genre>${englishName || sindhiName}</ai:genre>
    <ai:search_intent>categorical_browsing</ai:search_intent>
    <ai:content_quality>high</ai:content_quality>
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
    console.error('Error generating AI-optimized sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
