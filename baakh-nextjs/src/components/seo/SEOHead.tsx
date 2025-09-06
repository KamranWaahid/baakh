// Comprehensive SEO head component for poetry-driven optimization

import Head from 'next/head'
import { generatePoetryPageSEO, generatePoetSEOProfile } from '@/lib/poetry-seo-engine'
import { generatePoetMetadata, generatePoetryMetadata, generateCategoryMetadata, generateHomeMetadata } from '@/lib/metadata-generator'
import { generatePoetAIContext, generatePoetryAIContext } from '@/lib/ai-search-optimizer'

interface SEOHeadProps {
  type: 'poet' | 'poetry' | 'category' | 'home'
  data: any
  lang: 'sd' | 'en'
  additionalStructuredData?: any[]
}

export default function SEOHead({ type, data, lang, additionalStructuredData = [] }: SEOHeadProps) {
  let metadata: any = {}
  let aiContext: any = {}
  
  // Generate appropriate metadata based on type
  switch (type) {
    case 'poet':
      metadata = generatePoetMetadata(data, lang)
      aiContext = generatePoetAIContext(data, lang)
      break
    case 'poetry':
      metadata = generatePoetryMetadata(data, lang)
      aiContext = generatePoetryAIContext(data, lang)
      break
    case 'category':
      metadata = generateCategoryMetadata(data, lang)
      break
    case 'home':
      metadata = generateHomeMetadata(lang)
      break
  }

  // Combine all structured data
  const allStructuredData = [
    ...metadata.structuredData,
    ...additionalStructuredData
  ]

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta name="keywords" content={metadata.keywords.join(', ')} />
      <link rel="canonical" href={metadata.canonical} />
      
      {/* Language and Locale */}
      <meta httpEquiv="content-language" content={lang} />
      <meta name="language" content={lang === 'sd' ? 'Sindhi' : 'English'} />
      <meta name="locale" content={lang === 'sd' ? 'sd_PK' : 'en_US'} />
      
      {/* Alternate Language Versions */}
      {metadata.alternate && (
        <>
          <link rel="alternate" hrefLang="sd" href={metadata.alternate.sd} />
          <link rel="alternate" hrefLang="en" href={metadata.alternate.en} />
          <link rel="alternate" hrefLang="x-default" href={metadata.alternate.en} />
        </>
      )}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={metadata.openGraph.title} />
      <meta property="og:description" content={metadata.openGraph.description} />
      <meta property="og:type" content={metadata.openGraph.type} />
      <meta property="og:url" content={metadata.openGraph.url} />
      <meta property="og:image" content={metadata.openGraph.image} />
      <meta property="og:site_name" content={metadata.openGraph.siteName} />
      <meta property="og:locale" content={metadata.openGraph.locale} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={metadata.twitter.card} />
      <meta name="twitter:title" content={metadata.twitter.title} />
      <meta name="twitter:description" content={metadata.twitter.description} />
      <meta name="twitter:image" content={metadata.twitter.image} />
      {metadata.twitter.creator && (
        <meta name="twitter:creator" content={metadata.twitter.creator} />
      )}
      
      {/* AI Search Engine Meta Tags */}
      {Object.entries(metadata.aiMetaTags || {}).map(([key, value]) => (
        <meta key={key} name={key} content={String(value)} />
      ))}
      
      {/* Additional AI Meta Tags for Poetry Content */}
      {type === 'poet' && (
        <>
          <meta name="ai:author_significance" content={aiContext.content_quality} />
          <meta name="ai:literary_period" content={aiContext.literary_period} />
          <meta name="ai:cultural_impact" content={aiContext.cultural_impact} />
          <meta name="ai:themes" content={aiContext.themes.join(', ')} />
          <meta name="ai:related_concepts" content={aiContext.related_concepts.join(', ')} />
        </>
      )}
      
      {type === 'poetry' && (
        <>
          <meta name="ai:genre" content={aiContext.genre} />
          <meta name="ai:author" content={aiContext.author} />
          <meta name="ai:literary_techniques" content={aiContext.literary_techniques.join(', ')} />
          <meta name="ai:emotional_themes" content={aiContext.emotional_themes.join(', ')} />
          <meta name="ai:cultural_references" content={aiContext.cultural_references.join(', ')} />
        </>
      )}
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data, null, 2)
          }}
        />
      ))}
      
      {/* Additional Meta Tags for Poetry SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Content Type and Quality Indicators */}
      <meta name="content-type" content="text/html; charset=utf-8" />
      <meta name="content-language" content={lang === 'sd' ? 'Sindhi' : 'English'} />
      <meta name="audience" content="Literature Enthusiasts, Poetry Lovers, Cultural Researchers" />
      <meta name="subject" content="Sindhi Poetry, Literature, Culture" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      
      {/* Poetry-Specific Meta Tags */}
      <meta name="poetry:genre" content={type === 'poetry' ? data.category?.name : ''} />
      <meta name="poetry:author" content={type === 'poet' ? data.sindhi_name || data.english_name : data.poet?.sindhi_name || data.poet?.english_name} />
      <meta name="poetry:language" content={lang === 'sd' ? 'Sindhi' : 'English'} />
      <meta name="poetry:period" content={aiContext.literary_period || ''} />
      
      {/* Cultural Context Meta Tags */}
      <meta name="culture:region" content="Sindh, Pakistan" />
      <meta name="culture:language" content="Sindhi" />
      <meta name="culture:literature" content="Sindhi Literature" />
      <meta name="culture:tradition" content="Sindhi Poetry Tradition" />
      
      {/* Educational Meta Tags */}
      <meta name="education:level" content="General" />
      <meta name="education:subject" content="Literature, Poetry, Culture" />
      <meta name="education:type" content="Literary Work" />
      
      {/* Search Engine Optimization */}
      <meta name="revisit-after" content="7 days" />
      <meta name="expires" content="never" />
      <meta name="cache-control" content="public, max-age=31536000" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    </Head>
  )
}

// Hook for using SEO data in components
export function useSEOData(type: 'poet' | 'poetry' | 'category' | 'home', data: any, lang: 'sd' | 'en') {
  let metadata: any = {}
  let aiContext: any = {}
  
  switch (type) {
    case 'poet':
      metadata = generatePoetMetadata(data, lang)
      aiContext = generatePoetAIContext(data, lang)
      break
    case 'poetry':
      metadata = generatePoetryMetadata(data, lang)
      aiContext = generatePoetryAIContext(data, lang)
      break
    case 'category':
      metadata = generateCategoryMetadata(data, lang)
      break
    case 'home':
      metadata = generateHomeMetadata(lang)
      break
  }
  
  return {
    metadata,
    aiContext,
    structuredData: metadata.structuredData,
    aiMetaTags: metadata.aiMetaTags
  }
}
