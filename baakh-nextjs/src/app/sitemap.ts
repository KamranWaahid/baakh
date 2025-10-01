import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

// Base URL for the site
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baakh.com'

// Static pages that don't change frequently
const staticPages = [
  {
    url: '/sd',
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en',
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date().toISOString()
  },
  {
    url: '/sd/about',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/about',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  {
    url: '/sd/contact',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/contact',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date().toISOString()
  },
  {
    url: '/sd/donate',
    changefreq: 'monthly',
    priority: 0.6,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/donate',
    changefreq: 'monthly',
    priority: 0.6,
    lastmod: new Date().toISOString()
  },
  {
    url: '/sd/privacy-policy',
    changefreq: 'yearly',
    priority: 0.5,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/privacy-policy',
    changefreq: 'yearly',
    priority: 0.5,
    lastmod: new Date().toISOString()
  },
  {
    url: '/sd/terms-and-conditions',
    changefreq: 'yearly',
    priority: 0.5,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/terms-and-conditions',
    changefreq: 'yearly',
    priority: 0.5,
    lastmod: new Date().toISOString()
  }
]

// Main listing pages
const listingPages = [
  {
    url: '/sd/poets',
    changefreq: 'weekly',
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/poets',
    changefreq: 'weekly',
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  {
    url: '/sd/poetry',
    changefreq: 'daily',
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/poetry',
    changefreq: 'daily',
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  {
    url: '/sd/couplets',
    changefreq: 'daily',
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/couplets',
    changefreq: 'daily',
    priority: 0.9,
    lastmod: new Date().toISOString()
  },
  {
    url: '/sd/categories',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/categories',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  {
    url: '/sd/topics',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/topics',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString()
  },
  {
    url: '/sd/timeline',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date().toISOString()
  },
  {
    url: '/en/timeline',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date().toISOString()
  },
]

// Function to fetch dynamic content from database
async function fetchDynamicContent() {
  try {
    const supabase = createAdminClient()
    const sitemapEntries: any[] = []

    // Fetch poets
    const { data: poets } = await supabase
      .from('poets')
      .select('poet_slug, updated_at, created_at')
      .is('deleted_at', null)

    if (poets) {
      poets.forEach((poet: any) => {
        sitemapEntries.push({
          url: `/sd/poets/${poet.poet_slug}`,
          changefreq: 'monthly',
          priority: 0.8,
          lastmod: poet.updated_at || poet.created_at || new Date().toISOString()
        })
        sitemapEntries.push({
          url: `/en/poets/${poet.poet_slug}`,
          changefreq: 'monthly',
          priority: 0.8,
          lastmod: poet.updated_at || poet.created_at || new Date().toISOString()
        })
      })
    }

    // Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at, created_at')
      .is('deleted_at', null)

    if (categories) {
      categories.forEach((category: any) => {
        sitemapEntries.push({
          url: `/sd/categories/${category.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: category.updated_at || category.created_at || new Date().toISOString()
        })
        sitemapEntries.push({
          url: `/en/categories/${category.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: category.updated_at || category.created_at || new Date().toISOString()
        })
      })
    }

    // Fetch topics/tags
    const { data: topics } = await supabase
      .from('tags')
      .select('slug, updated_at, created_at')
      .eq('tag_type', 'topic')
      .is('deleted_at', null)

    if (topics) {
      topics.forEach((topic: any) => {
        sitemapEntries.push({
          url: `/sd/topic/${topic.slug}`,
          changefreq: 'weekly',
          priority: 0.6,
          lastmod: topic.updated_at || topic.created_at || new Date().toISOString()
        })
        sitemapEntries.push({
          url: `/en/topic/${topic.slug}`,
          changefreq: 'weekly',
          priority: 0.6,
          lastmod: topic.updated_at || topic.created_at || new Date().toISOString()
        })
      })
    }

    // Fetch poetry works (with pagination to avoid memory issues)
    const { data: poetry } = await supabase
      .from('poetry_main')
      .select(`
        poetry_slug,
        updated_at,
        created_at,
        poets!inner(poet_slug),
        categories!inner(slug)
      `)
      .eq('visibility', true)
      .is('deleted_at', null)
      .limit(1000) // Limit to prevent memory issues

    if (poetry) {
      poetry.forEach((poem: any) => {
        const poetSlug = (poem as any).poets?.poet_slug
        const categorySlug = (poem as any).categories?.slug
        
        if (poetSlug && categorySlug) {
          sitemapEntries.push({
            url: `/sd/poetry/${poem.poetry_slug}`,
            changefreq: 'monthly',
            priority: 0.7,
            lastmod: poem.updated_at || poem.created_at || new Date().toISOString()
          })
          sitemapEntries.push({
            url: `/en/poetry/${poem.poetry_slug}`,
            changefreq: 'monthly',
            priority: 0.7,
            lastmod: poem.updated_at || poem.created_at || new Date().toISOString()
          })
        }
      })
    }

    // Fetch couplets (with pagination)
    const { data: couplets } = await supabase
      .from('poetry_couplets')
      .select('couplet_slug, updated_at, created_at')
      .is('deleted_at', null)
      .limit(1000) // Limit to prevent memory issues

    if (couplets) {
      couplets.forEach((couplet: any) => {
        sitemapEntries.push({
          url: `/sd/couplets/${couplet.couplet_slug}`,
          changefreq: 'monthly',
          priority: 0.6,
          lastmod: couplet.updated_at || couplet.created_at || new Date().toISOString()
        })
        sitemapEntries.push({
          url: `/en/couplets/${couplet.couplet_slug}`,
          changefreq: 'monthly',
          priority: 0.6,
          lastmod: couplet.updated_at || couplet.created_at || new Date().toISOString()
        })
      })
    }

    return sitemapEntries
  } catch (error) {
    console.error('Error fetching dynamic content for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Combine static and dynamic content
  const dynamicContent = await fetchDynamicContent()
  
  const allPages = [
    ...staticPages,
    ...listingPages,
    ...dynamicContent
  ]

  // Convert to Next.js sitemap format
  return allPages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: page.lastmod,
    changeFrequency: page.changefreq as any,
    priority: page.priority
  }))
}
