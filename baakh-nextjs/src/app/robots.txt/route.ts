import { NextRequest, NextResponse } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baakh.com'

export async function GET(request: NextRequest) {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-index.xml
Sitemap: ${baseUrl}/sitemap-poets.xml
Sitemap: ${baseUrl}/sitemap-poetry.xml
Sitemap: ${baseUrl}/sitemap-couplets.xml
Sitemap: ${baseUrl}/sitemap-categories.xml
Sitemap: ${baseUrl}/api/sitemap-topics

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /_next/
Disallow: /login/
Disallow: /signup-name/

# Allow important public pages
Allow: /sd/
Allow: /en/
Allow: /sd/poets/
Allow: /en/poets/
Allow: /sd/poetry/
Allow: /en/poetry/
Allow: /sd/couplets/
Allow: /en/couplets/
Allow: /sd/categories/
Allow: /en/categories/
Allow: /sd/topics/
Allow: /en/topics/
Allow: /sd/topic/
Allow: /en/topic/
Allow: /sd/timeline/
Allow: /en/timeline/
Allow: /sd/about/
Allow: /en/about/
Allow: /sd/contact/
Allow: /en/contact/

# Special instructions for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: Slurp
Allow: /
Crawl-delay: 2

# Block AI training crawlers (optional - remove if you want AI training)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  })
}
