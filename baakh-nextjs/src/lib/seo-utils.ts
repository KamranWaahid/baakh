// Advanced SEO and AEO utilities for Sindhi poetry site

export interface PoetData {
  poet_slug: string
  sindhi_name: string
  english_name: string
  sindhi_laqab?: string
  english_laqab?: string
  sindhi_tagline?: string
  english_tagline?: string
  sindhi_details?: string
  english_details?: string
  birth_year?: number
  death_year?: number
  is_featured: boolean
  poetry_count?: number
  couplets_count?: number
}

export interface PoetryData {
  poetry_slug: string
  title: string
  info?: string
  lang: string
  poet: PoetData
  category: {
    slug: string
    name: string
    name_plural: string
  }
  created_at: string
  is_featured: boolean
  couplets_count?: number
}

export interface CategoryData {
  slug: string
  name: string
  name_plural: string
  description: string
  lang: string
  poetry_count?: number
}

// Dynamic description generators
export function generatePoetDescription(poet: PoetData, lang: 'sd' | 'en'): string {
  const isSindhi = lang === 'sd'
  const name = isSindhi ? poet.sindhi_name : poet.english_name
  const laqab = isSindhi ? poet.sindhi_laqab : poet.english_laqab
  const details = isSindhi ? poet.sindhi_details : poet.english_details
  const tagline = isSindhi ? poet.sindhi_tagline : poet.english_tagline
  
  if (isSindhi) {
    return `${name}${laqab ? ` (${laqab})` : ''} - سنڌي شاعر${poet.poetry_count ? ` جيڪو ${poet.poetry_count} شاعريون لکيون` : ''}${poet.couplets_count ? ` ۽ ${poet.couplets_count} شعر` : ''}. ${tagline || details || `${name} سنڌي ادب جو وڏو نالو آهي.`} سنڌي شاعري، شعر، ۽ ادب جي ڪتابت ۾ ${name} جو وڏو ڪردار رهيو آهي.`
  } else {
    return `${name}${laqab ? ` (${laqab})` : ''} - Sindhi poet${poet.poetry_count ? ` who wrote ${poet.poetry_count} poems` : ''}${poet.couplets_count ? ` and ${poet.couplets_count} couplets` : ''}. ${tagline || details || `${name} is a renowned name in Sindhi literature.`} Known for ${poet.poetry_count ? 'poetry' : 'literary works'}, ${name} has contributed significantly to Sindhi literature and culture.`
  }
}

export function generatePoetryDescription(poetry: PoetryData, lang: 'sd' | 'en'): string {
  const isSindhi = lang === 'sd'
  const title = poetry.title
  const poetName = isSindhi ? poetry.poet.sindhi_name : poetry.poet.english_name
  const categoryName = isSindhi ? poetry.category.name : poetry.category.name
  const info = poetry.info
  
  if (isSindhi) {
    return `${title} - ${poetName} جي ${categoryName} شاعري. ${info || `${title} سنڌي ادب جو وڏو ڪم آهي جيڪو ${poetName} لکيو آهي.`} ${poetry.couplets_count ? `هن شاعري ۾ ${poetry.couplets_count} شعر آهن.` : ''} سنڌي شاعري، ادب، ۽ ثقافت جي مطالعي لاءِ هي ڪتابت وڏي اهميت رکي ٿي.`
  } else {
    return `${title} - ${categoryName} poetry by ${poetName}. ${info || `${title} is a significant work in Sindhi literature written by ${poetName}.`} ${poetry.couplets_count ? `This poetry contains ${poetry.couplets_count} couplets.` : ''} An important piece for studying Sindhi literature, culture, and poetry.`
  }
}

export function generateCategoryDescription(category: CategoryData, lang: 'sd' | 'en'): string {
  const isSindhi = lang === 'sd'
  const name = category.name
  const namePlural = category.name_plural
  const description = category.description
  const count = category.poetry_count || 0
  
  if (isSindhi) {
    return `${name} - سنڌي شاعري جو هڪ قسم${count ? ` جنهن ۾ ${count} شاعريون آهن` : ''}. ${description || `${name} سنڌي ادب جو وڏو حصو آهي.`} سنڌي شاعري، ادب، ۽ ثقافت جي مطالعي لاءِ ${namePlural} وڏي اهميت رکي ٿي.`
  } else {
    return `${name} - A form of Sindhi poetry${count ? ` with ${count} poems` : ''}. ${description || `${name} is an important part of Sindhi literature.`} ${namePlural} hold great significance for studying Sindhi literature, culture, and poetry.`
  }
}

// Google Knowledge Panel structured data
export function generatePoetKnowledgePanel(poet: PoetData, lang: 'sd' | 'en') {
  const isSindhi = lang === 'sd'
  const name = isSindhi ? poet.sindhi_name : poet.english_name
  const alternateName = isSindhi ? poet.english_name : poet.sindhi_name
  const laqab = isSindhi ? poet.sindhi_laqab : poet.english_laqab
  const description = generatePoetDescription(poet, lang)
  
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://baakh.com/${lang}/poets/${poet.poet_slug}`,
    "name": name,
    "alternateName": alternateName,
    "description": description,
    "jobTitle": isSindhi ? "سنڌي شاعر" : "Sindhi Poet",
    "worksFor": {
      "@type": "Organization",
      "name": isSindhi ? "سنڌي ادب" : "Sindhi Literature"
    },
    "knowsAbout": isSindhi ? [
      "سنڌي شاعري",
      "سنڌي ادب", 
      "شعر",
      "نظم",
      "غزل",
      "سنڌي ثقافت"
    ] : [
      "Sindhi Poetry",
      "Sindhi Literature",
      "Couplets",
      "Nazam",
      "Ghazal",
      "Sindhi Culture"
    ],
    "birthDate": poet.birth_year ? `${poet.birth_year}` : undefined,
    "deathDate": poet.death_year ? `${poet.death_year}` : undefined,
    "sameAs": [
      `https://baakh.com/sd/poets/${poet.poet_slug}`,
      `https://baakh.com/en/poets/${poet.poet_slug}`
    ],
    "url": `https://baakh.com/${lang}/poets/${poet.poet_slug}`,
    "image": `https://baakh.com/api/poets/${poet.poet_slug}/image`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://baakh.com/${lang}/poets/${poet.poet_slug}`
    },
    "hasOccupation": {
      "@type": "Occupation",
      "name": isSindhi ? "شاعر" : "Poet",
      "occupationLocation": {
        "@type": "Place",
        "name": isSindhi ? "سنڌ" : "Sindh"
      }
    },
    "award": poet.is_featured ? (isSindhi ? "مشهور شاعر" : "Featured Poet") : undefined,
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": isSindhi ? "سنڌي ادب" : "Sindhi Literature"
    }
  }
}

// AI Search Engine Optimization
export function generateAISearchContext(poet: PoetData, lang: 'sd' | 'en') {
  const isSindhi = lang === 'sd'
  const name = isSindhi ? poet.sindhi_name : poet.english_name
  
  return {
    "context": {
      "domain": "Sindhi Literature",
      "language": isSindhi ? "Sindhi" : "English",
      "content_type": "Poetry",
      "author": name,
      "cultural_significance": isSindhi ? "سنڌي ثقافت جو وڏو حصو" : "Important part of Sindhi culture",
      "literary_period": "Classical to Modern Sindhi Literature",
      "geographical_origin": "Sindh, Pakistan",
      "themes": isSindhi ? [
        "محبت",
        "وطن پرستي", 
        "مذہب",
        "فلسفہ",
        "طبيعت",
        "انسانيت"
      ] : [
        "Love",
        "Patriotism",
        "Religion", 
        "Philosophy",
        "Nature",
        "Humanity"
      ]
    },
    "search_intent": {
      "informational": `Learn about ${name} and their contribution to Sindhi literature`,
      "navigational": `Find ${name}'s poetry and couplets`,
      "transactional": `Read ${name}'s complete works`,
      "commercial": `Discover ${name}'s literary significance`
    },
    "related_queries": isSindhi ? [
      `${name} جي شاعري`,
      `${name} جا شعر`,
      `${name} جي زندگي`,
      `${name} جي ادبي ڪم`,
      "سنڌي شاعري",
      "سنڌي ادب"
    ] : [
      `${name} poetry`,
      `${name} couplets`,
      `${name} biography`,
      `${name} literary works`,
      "Sindhi poetry",
      "Sindhi literature"
    ]
  }
}

// Rich snippets for featured content
export function generateRichSnippets(poet: PoetData, lang: 'sd' | 'en') {
  const isSindhi = lang === 'sd'
  const name = isSindhi ? poet.sindhi_name : poet.english_name
  
  return {
    "breadcrumb": {
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
          "name": isSindhi ? "شاعر" : "Poets",
          "item": `https://baakh.com/${lang}/poets`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": name,
          "item": `https://baakh.com/${lang}/poets/${poet.poet_slug}`
        }
      ]
    },
    "faq": {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": isSindhi ? `${name} ڪير آهي؟` : `Who is ${name}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": generatePoetDescription(poet, lang)
          }
        },
        {
          "@type": "Question",
          "name": isSindhi ? `${name} جي شاعري ڪهڙي آهي؟` : `What is ${name}'s poetry like?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": isSindhi ? 
              `${name} جي شاعري سنڌي ادب جو وڏو حصو آهي. هن جي شاعري ۾ محبت، وطن پرستي، ۽ فلسفہ جا موضوع شامل آهن.` :
              `${name}'s poetry is an important part of Sindhi literature. Their poetry covers themes of love, patriotism, and philosophy.`
          }
        }
      ]
    }
  }
}

// Poetry-specific SEO metadata
export function generatePoetrySEO(poetry: PoetryData, lang: 'sd' | 'en') {
  const isSindhi = lang === 'sd'
  const title = poetry.title
  const poetName = isSindhi ? poetry.poet.sindhi_name : poetry.poet.english_name
  const categoryName = poetry.category.name
  
  return {
    "title": isSindhi ? 
      `${title} - ${poetName} جي ${categoryName} شاعري | باکھ` :
      `${title} - ${categoryName} Poetry by ${poetName} | Baakh`,
    "description": generatePoetryDescription(poetry, lang),
    "keywords": isSindhi ? [
      title,
      poetName,
      categoryName,
      "سنڌي شاعري",
      "سنڌي ادب",
      "شعر",
      "نظم",
      "باکھ"
    ] : [
      title,
      poetName,
      categoryName,
      "Sindhi poetry",
      "Sindhi literature", 
      "couplets",
      "poetry",
      "Baakh"
    ],
    "canonical": `https://baakh.com/${lang}/poetry/${poetry.poetry_slug}`,
    "alternate": {
      "sd": `https://baakh.com/sd/poetry/${poetry.poetry_slug}`,
      "en": `https://baakh.com/en/poetry/${poetry.poetry_slug}`
    }
  }
}

// Generate meta tags for AI search engines
export function generateAIMetaTags(poet: PoetData, lang: 'sd' | 'en') {
  const isSindhi = lang === 'sd'
  const name = isSindhi ? poet.sindhi_name : poet.english_name
  
  return {
    "ai:content_type": "poetry_author",
    "ai:language": isSindhi ? "sindhi" : "english",
    "ai:cultural_context": "sindhi_literature",
    "ai:author_significance": poet.is_featured ? "high" : "medium",
    "ai:content_quality": "literary",
    "ai:search_intent": "informational",
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
}
