// Advanced metadata generator for SEO and AEO optimization

import { generatePoetDescription, generatePoetryDescription, generateCategoryDescription, generatePoetKnowledgePanel, generateAISearchContext, generateRichSnippets, generatePoetrySEO, generateAIMetaTags } from './seo-utils'
import type { PoetData, PoetryData, CategoryData } from './seo-utils'

export interface PageMetadata {
  title: string
  description: string
  keywords: string[]
  canonical: string
  alternate?: {
    sd: string
    en: string
  }
  openGraph: {
    title: string
    description: string
    type: string
    url: string
    image: string
    siteName: string
    locale: string
  }
  twitter: {
    card: string
    title: string
    description: string
    image: string
    creator?: string
  }
  structuredData: any[]
  aiMetaTags: Record<string, any>
}

// Generate metadata for poet pages
export function generatePoetMetadata(poet: PoetData, lang: 'sd' | 'en'): PageMetadata {
  const isSindhi = lang === 'sd'
  const name = isSindhi ? poet.sindhi_name : poet.english_name
  const laqab = isSindhi ? poet.sindhi_laqab : poet.english_laqab
  const title = isSindhi ? 
    `${name}${laqab ? ` (${laqab})` : ''} - سنڌي شاعر | باکھ` :
    `${name}${laqab ? ` (${laqab})` : ''} - Sindhi Poet | Baakh`
  
  const description = generatePoetDescription(poet, lang)
  const keywords = isSindhi ? [
    name,
    poet.english_name,
    "سنڌي شاعر",
    "سنڌي شاعري", 
    "سنڌي ادب",
    "شعر",
    "نظم",
    "غزل",
    "باکھ",
    "سنڌي ثقافت"
  ] : [
    name,
    poet.sindhi_name,
    "Sindhi poet",
    "Sindhi poetry",
    "Sindhi literature",
    "couplets",
    "nazam",
    "ghazal",
    "Baakh",
    "Sindhi culture"
  ]

  return {
    title,
    description,
    keywords,
    canonical: `https://baakh.com/${lang}/poets/${poet.poet_slug}`,
    alternate: {
      sd: `https://baakh.com/sd/poets/${poet.poet_slug}`,
      en: `https://baakh.com/en/poets/${poet.poet_slug}`
    },
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `https://baakh.com/${lang}/poets/${poet.poet_slug}`,
      image: `https://baakh.com/api/poets/${poet.poet_slug}/og-image`,
      siteName: isSindhi ? 'باکھ - سنڌي شاعري' : 'Baakh - Sindhi Poetry',
      locale: isSindhi ? 'sd_PK' : 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: `https://baakh.com/api/poets/${poet.poet_slug}/og-image`,
      creator: '@baakh_sindhi'
    },
    structuredData: [
      generatePoetKnowledgePanel(poet, lang),
      generateRichSnippets(poet, lang).breadcrumb,
      generateRichSnippets(poet, lang).faq
    ],
    aiMetaTags: generateAIMetaTags(poet, lang)
  }
}

// Generate metadata for poetry pages
export function generatePoetryMetadata(poetry: PoetryData, lang: 'sd' | 'en'): PageMetadata {
  const isSindhi = lang === 'sd'
  const title = poetry.title
  const poetName = isSindhi ? poetry.poet.sindhi_name : poetry.poet.english_name
  const categoryName = poetry.category.name
  
  const seoData = generatePoetrySEO(poetry, lang)
  const description = generatePoetryDescription(poetry, lang)
  
  const openGraphTitle = isSindhi ? 
    `${title} - ${poetName} جي ${categoryName} شاعري` :
    `${title} - ${categoryName} Poetry by ${poetName}`

  return {
    title: seoData.title,
    description,
    keywords: seoData.keywords,
    canonical: seoData.canonical,
    alternate: seoData.alternate,
    openGraph: {
      title: openGraphTitle,
      description,
      type: 'article',
      url: `https://baakh.com/${lang}/poetry/${poetry.poetry_slug}`,
      image: `https://baakh.com/api/poetry/${poetry.poetry_slug}/og-image`,
      siteName: isSindhi ? 'باکھ - سنڌي شاعري' : 'Baakh - Sindhi Poetry',
      locale: isSindhi ? 'sd_PK' : 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title: openGraphTitle,
      description,
      image: `https://baakh.com/api/poetry/${poetry.poetry_slug}/og-image`,
      creator: '@baakh_sindhi'
    },
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `https://baakh.com/${lang}/poetry/${poetry.poetry_slug}`,
        "headline": title,
        "description": description,
        "author": {
          "@type": "Person",
          "name": poetName,
          "url": `https://baakh.com/${lang}/poets/${poetry.poet.poet_slug}`
        },
        "publisher": {
          "@type": "Organization",
          "name": isSindhi ? 'باکھ' : 'Baakh',
          "url": "https://baakh.com"
        },
        "datePublished": poetry.created_at,
        "inLanguage": isSindhi ? 'sd' : 'en',
        "genre": categoryName,
        "url": `https://baakh.com/${lang}/poetry/${poetry.poetry_slug}`,
        "image": `https://baakh.com/api/poetry/${poetry.poetry_slug}/og-image`
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": isSindhi ? "گھر" : "Home",
            "item": `https://baakh.com/${lang}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": isSindhi ? "شاعري" : "Poetry",
            "item": `https://baakh.com/${lang}/poetry`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": title,
            "item": `https://baakh.com/${lang}/poetry/${poetry.poetry_slug}`
          }
        ]
      }
    ],
    aiMetaTags: {
      "ai:content_type": "poetry",
      "ai:language": isSindhi ? "sindhi" : "english",
      "ai:cultural_context": "sindhi_literature",
      "ai:author": poetName,
      "ai:genre": categoryName,
      "ai:search_intent": "literary_reading",
      "ai:content_quality": "literary"
    }
  }
}

// Generate metadata for category pages
export function generateCategoryMetadata(category: CategoryData, lang: 'sd' | 'en'): PageMetadata {
  const isSindhi = lang === 'sd'
  const name = category.name
  const title = isSindhi ? 
    `${name} - سنڌي شاعري جو قسم | باکھ` :
    `${name} - Type of Sindhi Poetry | Baakh`
  
  const description = generateCategoryDescription(category, lang)
  const keywords = isSindhi ? [
    name,
    "سنڌي شاعري",
    "سنڌي ادب",
    "شعر",
    "نظم",
    "غزل",
    "باکھ",
    "سنڌي ثقافت"
  ] : [
    name,
    "Sindhi poetry",
    "Sindhi literature",
    "couplets",
    "nazam",
    "ghazal",
    "Baakh",
    "Sindhi culture"
  ]

  return {
    title,
    description,
    keywords,
    canonical: `https://baakh.com/${lang}/categories/${category.slug}`,
    alternate: {
      sd: `https://baakh.com/sd/categories/${category.slug}`,
      en: `https://baakh.com/en/categories/${category.slug}`
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://baakh.com/${lang}/categories/${category.slug}`,
      image: `https://baakh.com/api/categories/${category.slug}/og-image`,
      siteName: isSindhi ? 'باکھ - سنڌي شاعري' : 'Baakh - Sindhi Poetry',
      locale: isSindhi ? 'sd_PK' : 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: `https://baakh.com/api/categories/${category.slug}/og-image`,
      creator: '@baakh_sindhi'
    },
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `https://baakh.com/${lang}/categories/${category.slug}`,
        "name": name,
        "description": description,
        "inLanguage": isSindhi ? 'sd' : 'en',
        "url": `https://baakh.com/${lang}/categories/${category.slug}`,
        "image": `https://baakh.com/api/categories/${category.slug}/og-image`,
        "isPartOf": {
          "@type": "WebSite",
          "name": isSindhi ? 'باکھ - سنڌي شاعري' : 'Baakh - Sindhi Poetry',
          "url": `https://baakh.com/${lang}`
        }
      }
    ],
    aiMetaTags: {
      "ai:content_type": "poetry_category",
      "ai:language": isSindhi ? "sindhi" : "english",
      "ai:cultural_context": "sindhi_literature",
      "ai:genre": name,
      "ai:search_intent": "categorical_browsing",
      "ai:content_quality": "literary"
    }
  }
}

// Generate metadata for home page
export function generateHomeMetadata(lang: 'sd' | 'en'): PageMetadata {
  const isSindhi = lang === 'sd'
  const title = isSindhi ? 
    'باکھ - سنڌي شاعري، شعر، ۽ ادب جو وڏو مجموعو' :
    'Baakh - Comprehensive Collection of Sindhi Poetry, Couplets & Literature'
  
  const description = isSindhi ? 
    'سنڌي شاعري، شعر، ۽ ادب جو وڏو مجموعو. مشهور سنڌي شاعرن جي شاعري، شعر، ۽ ادبي ڪم پڙهو. سنڌي ثقافت ۽ ادب جي مطالعي لاءِ بهترين جڳهه.' :
    'Comprehensive collection of Sindhi poetry, couplets, and literature. Read works by famous Sindhi poets. The best place to study Sindhi culture and literature.'

  const keywords = isSindhi ? [
    "سنڌي شاعري",
    "سنڌي ادب",
    "شعر",
    "نظم",
    "غزل",
    "سنڌي شاعر",
    "باکھ",
    "سنڌي ثقافت",
    "سنڌي زبان"
  ] : [
    "Sindhi poetry",
    "Sindhi literature",
    "couplets",
    "nazam",
    "ghazal",
    "Sindhi poets",
    "Baakh",
    "Sindhi culture",
    "Sindhi language"
  ]

  return {
    title,
    description,
    keywords,
    canonical: `https://baakh.com/${lang}`,
    alternate: {
      sd: 'https://baakh.com/sd',
      en: 'https://baakh.com/en'
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://baakh.com/${lang}`,
      image: 'https://baakh.com/api/og-image?title=Sindhi Poetry Collection',
      siteName: isSindhi ? 'باکھ - سنڌي شاعري' : 'Baakh - Sindhi Poetry',
      locale: isSindhi ? 'sd_PK' : 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: 'https://baakh.com/api/og-image?title=Sindhi Poetry Collection',
      creator: '@baakh_sindhi'
    },
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `https://baakh.com/${lang}`,
        "name": isSindhi ? 'باکھ - سنڌي شاعري' : 'Baakh - Sindhi Poetry',
        "description": description,
        "url": `https://baakh.com/${lang}`,
        "inLanguage": isSindhi ? 'sd' : 'en',
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `https://baakh.com/${lang}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Baakh",
          "url": "https://baakh.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://baakh.com/logo.png"
          }
        }
      }
    ],
    aiMetaTags: {
      "ai:content_type": "literary_website",
      "ai:language": isSindhi ? "sindhi" : "english",
      "ai:cultural_context": "sindhi_literature",
      "ai:search_intent": "literary_discovery",
      "ai:content_quality": "high",
      "ai:target_audience": "literature_enthusiasts"
    }
  }
}

// Generate AI-optimized meta tags for search engines
export function generateAIMetaTags(content: any, type: 'poet' | 'poetry' | 'category' | 'home', lang: 'sd' | 'en') {
  const isSindhi = lang === 'sd'
  
  const baseTags = {
    "ai:content_type": type,
    "ai:language": isSindhi ? "sindhi" : "english",
    "ai:cultural_context": "sindhi_literature",
    "ai:search_intent": "informational",
    "ai:content_quality": "literary"
  }

  switch (type) {
    case 'poet':
      return {
        ...baseTags,
        "ai:author_significance": content.is_featured ? "high" : "medium",
        "ai:related_topics": isSindhi ? [
          "سنڌي شاعري",
          "سنڌي ادب",
          "شعر",
          "نظم",
          "غزل"
        ] : [
          "sindhi_poetry",
          "sindhi_literature",
          "couplets",
          "nazam",
          "ghazal"
        ]
      }
    case 'poetry':
      return {
        ...baseTags,
        "ai:genre": content.category.name,
        "ai:author": isSindhi ? content.poet.sindhi_name : content.poet.english_name,
        "ai:search_intent": "literary_reading"
      }
    case 'category':
      return {
        ...baseTags,
        "ai:genre": content.name,
        "ai:search_intent": "categorical_browsing"
      }
    case 'home':
      return {
        ...baseTags,
        "ai:search_intent": "literary_discovery",
        "ai:target_audience": "literature_enthusiasts"
      }
    default:
      return baseTags
  }
}
