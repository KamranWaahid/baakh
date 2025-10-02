import { MetadataRoute } from 'next'

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use only static pages for now (no database dependency)
  const allPages = [
    ...staticPages,
    ...listingPages
  ]

  // Convert to Next.js sitemap format
  return allPages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: page.lastmod,
    changeFrequency: page.changefreq as any,
    priority: page.priority
  }))
}
