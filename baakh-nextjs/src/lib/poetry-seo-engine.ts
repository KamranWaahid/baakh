// Poetry-driven SEO engine for maximum literary content discoverability

export interface PoetrySEOContext {
  // Core content
  title: string
  content: string
  author: string
  category: string
  language: 'sindhi' | 'english'
  
  // Literary analysis
  themes: string[]
  emotions: string[]
  literary_devices: string[]
  cultural_references: string[]
  historical_period: string
  literary_style: string
  
  // SEO optimization
  primary_keywords: string[]
  long_tail_keywords: string[]
  semantic_keywords: string[]
  question_keywords: string[]
  
  // Content quality
  readability_score: number
  literary_value: number
  cultural_significance: number
  uniqueness_score: number
}

export interface PoetSEOProfile {
  name: string
  alternate_names: string[]
  literary_period: string
  specialization: string[]
  famous_works: string[]
  influence_scope: string[]
  cultural_impact: string
  seo_authority: number
}

// Generate poetry-specific SEO keywords
export function generatePoetryKeywords(poetry: any, lang: 'sd' | 'en'): {
  primary: string[]
  long_tail: string[]
  semantic: string[]
  questions: string[]
} {
  const isSindhi = lang === 'sd'
  const title = poetry.title
  const poetName = isSindhi ? poetry.poet.sindhi_name : poetry.poet.english_name
  const category = poetry.category.name
  
  // Primary keywords
  const primary = isSindhi ? [
    'سنڌي شاعري',
    'سنڌي ادب',
    'شعر',
    'نظم',
    'غزل',
    poetName,
    title
  ] : [
    'Sindhi poetry',
    'Sindhi literature',
    'couplets',
    'nazam',
    'ghazal',
    poetName,
    title
  ]
  
  // Long-tail keywords
  const long_tail = isSindhi ? [
    `${poetName} جي ${category} شاعري`,
    `${title} سنڌي شاعري`,
    `${poetName} جا مشهور شعر`,
    `سنڌي ${category} شاعري`,
    `${title} جي تشريح`,
    `${poetName} جي شاعري پڙهو`
  ] : [
    `${category} poetry by ${poetName}`,
    `${title} Sindhi poetry`,
    `famous poems by ${poetName}`,
    `Sindhi ${category} poetry`,
    `explanation of ${title}`,
    `read ${poetName} poetry`
  ]
  
  // Semantic keywords
  const semantic = isSindhi ? [
    'سنڌي ثقافت',
    'سنڌي زبان',
    'سنڌي تاريخ',
    'سنڌي رواج',
    'مذہبي شاعري',
    'وطن پرستي شاعري',
    'محبتي شاعري',
    'فلسفي شاعري'
  ] : [
    'Sindhi culture',
    'Sindhi language',
    'Sindhi history',
    'Sindhi traditions',
    'religious poetry',
    'patriotic poetry',
    'love poetry',
    'philosophical poetry'
  ]
  
  // Question keywords
  const questions = isSindhi ? [
    `${poetName} ڪير آهي؟`,
    `${title} جي معني ڇا آهي؟`,
    `${poetName} جي شاعري ڪيئن پڙهجي؟`,
    `سنڌي شاعري ڪيئن سکجي؟`,
    `${category} شاعري ڇا آهي؟`
  ] : [
    `Who is ${poetName}?`,
    `What does ${title} mean?`,
    `How to read ${poetName} poetry?`,
    `How to learn Sindhi poetry?`,
    `What is ${category} poetry?`
  ]
  
  return { primary, long_tail, semantic, questions }
}

// Generate poet SEO profile
export function generatePoetSEOProfile(poet: any, lang: 'sd' | 'en'): PoetSEOProfile {
  const isSindhi = lang === 'sd'
  const name = isSindhi ? poet.sindhi_name : poet.english_name
  const alternateName = isSindhi ? poet.english_name : poet.sindhi_name
  
  return {
    name,
    alternate_names: [alternateName, poet.sindhi_laqab, poet.english_laqab].filter(Boolean),
    literary_period: determineLiteraryPeriod(poet.birth_year, poet.death_year),
    specialization: isSindhi ? [
      'سنڌي شاعري',
      'شعر',
      'نظم',
      'غزل',
      'مذہبي شاعري'
    ] : [
      'Sindhi Poetry',
      'Couplets',
      'Nazam',
      'Ghazal',
      'Religious Poetry'
    ],
    famous_works: [], // Would be populated from database
    influence_scope: isSindhi ? [
      'سنڌي ادب',
      'سنڌي ثقافت',
      'نئين نسل'
    ] : [
      'Sindhi Literature',
      'Sindhi Culture',
      'New Generation'
    ],
    cultural_impact: isSindhi ? 
      `${name} سنڌي ثقافت ۽ ادب تي وڏو اثر رکيو آهي` :
      `${name} has significantly influenced Sindhi culture and literature`,
    seo_authority: calculatePoetAuthority(poet)
  }
}

// Generate rich snippets for poetry
export function generatePoetryRichSnippets(poetry: any, lang: 'sd' | 'en'): any {
  const isSindhi = lang === 'sd'
  const title = poetry.title
  const poetName = isSindhi ? poetry.poet.sindhi_name : poetry.poet.english_name
  
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": title,
    "author": {
      "@type": "Person",
      "name": poetName,
      "url": `https://baakh.com/${lang}/poets/${poetry.poet.poet_slug}`
    },
    "genre": poetry.category.name,
    "inLanguage": isSindhi ? 'sd' : 'en',
    "dateCreated": poetry.created_at,
    "description": isSindhi ? 
      `${title} - ${poetName} جي ${poetry.category.name} شاعري` :
      `${title} - ${poetry.category.name} poetry by ${poetName}`,
    "keywords": generatePoetryKeywords(poetry, lang).primary.join(', '),
    "about": {
      "@type": "Thing",
      "name": isSindhi ? 'سنڌي شاعري' : 'Sindhi Poetry'
    },
    "audience": {
      "@type": "Audience",
      "audienceType": isSindhi ? 'سنڌي ادب جا شوقين' : 'Literature Enthusiasts'
    },
    "educationalUse": isSindhi ? 'تعليمي' : 'Educational',
    "learningResourceType": isSindhi ? 'شاعري' : 'Poetry',
    "teaches": isSindhi ? [
      'سنڌي شاعري',
      'سنڌي ادب',
      'شاعري جي تکنيڪ'
    ] : [
      'Sindhi Poetry',
      'Sindhi Literature',
      'Poetry Techniques'
    ]
  }
}

// Generate FAQ structured data for poetry
export function generatePoetryFAQ(poetry: any, lang: 'sd' | 'en'): any {
  const isSindhi = lang === 'sd'
  const title = poetry.title
  const poetName = isSindhi ? poetry.poet.sindhi_name : poetry.poet.english_name
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isSindhi ? `${title} ڇا آهي؟` : `What is ${title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isSindhi ? 
            `${title} ${poetName} جي ${poetry.category.name} شاعري آهي.` :
            `${title} is a ${poetry.category.name} poetry by ${poetName}.`
        }
      },
      {
        "@type": "Question",
        "name": isSindhi ? `${poetName} ڪير آهي؟` : `Who is ${poetName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isSindhi ? 
            `${poetName} سنڌي شاعر آهي جيڪو ${poetry.category.name} شاعري لکي آهي.` :
            `${poetName} is a Sindhi poet who wrote ${poetry.category.name} poetry.`
        }
      },
      {
        "@type": "Question",
        "name": isSindhi ? `${poetry.category.name} شاعري ڇا آهي؟` : `What is ${poetry.category.name} poetry?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isSindhi ? 
            `${poetry.category.name} سنڌي شاعري جو هڪ قسم آهي.` :
            `${poetry.category.name} is a type of Sindhi poetry.`
        }
      }
    ]
  }
}

// Generate breadcrumb structured data
export function generatePoetryBreadcrumbs(poetry: any, lang: 'sd' | 'en'): any {
  const isSindhi = lang === 'sd'
  
  return {
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
        "name": poetry.category.name,
        "item": `https://baakh.com/${lang}/categories/${poetry.category.slug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": poetry.title,
        "item": `https://baakh.com/${lang}/poetry/${poetry.poetry_slug}`
      }
    ]
  }
}

// Generate meta tags for AI search engines
export function generatePoetryAIMetaTags(poetry: any, lang: 'sd' | 'en'): Record<string, string> {
  const isSindhi = lang === 'sd'
  const keywords = generatePoetryKeywords(poetry, lang)
  
  return {
    'ai:content_type': 'poetry',
    'ai:language': isSindhi ? 'sindhi' : 'english',
    'ai:cultural_context': 'sindhi_literature',
    'ai:literary_genre': poetry.category.name,
    'ai:author': isSindhi ? poetry.poet.sindhi_name : poetry.poet.english_name,
    'ai:themes': keywords.semantic.join(', '),
    'ai:search_intent': 'literary_reading',
    'ai:content_quality': poetry.is_featured ? 'high' : 'medium',
    'ai:educational_value': 'high',
    'ai:cultural_significance': 'high',
    'ai:target_audience': 'literature_enthusiasts',
    'ai:related_queries': keywords.questions.join(', '),
    'ai:semantic_keywords': keywords.semantic.join(', '),
    'ai:long_tail_keywords': keywords.long_tail.join(', ')
  }
}

// Helper functions
function determineLiteraryPeriod(birthYear?: number, deathYear?: number): string {
  if (!birthYear) return 'Unknown Period'
  
  if (birthYear < 1800) return 'Classical Period'
  if (birthYear < 1900) return 'Pre-Modern Period'
  if (birthYear < 1950) return 'Modern Period'
  if (birthYear < 1980) return 'Contemporary Period'
  return 'Post-Contemporary Period'
}

function calculatePoetAuthority(poet: any): number {
  let score = 0.5 // Base score
  
  if (poet.is_featured) score += 0.3
  if (poet.poetry_count > 10) score += 0.1
  if (poet.couplets_count > 50) score += 0.1
  if (poet.sindhi_details && poet.sindhi_details.length > 100) score += 0.1
  
  return Math.min(score, 1.0)
}

// Generate comprehensive SEO metadata for poetry pages
export function generatePoetryPageSEO(poetry: any, lang: 'sd' | 'en'): {
  title: string
  description: string
  keywords: string[]
  structuredData: any[]
  aiMetaTags: Record<string, string>
} {
  const isSindhi = lang === 'sd'
  const title = poetry.title
  const poetName = isSindhi ? poetry.poet.sindhi_name : poetry.poet.english_name
  const category = poetry.category.name
  
  const seoTitle = isSindhi ? 
    `${title} - ${poetName} جي ${category} شاعري | باکھ` :
    `${title} - ${category} Poetry by ${poetName} | Baakh`
  
  const description = isSindhi ? 
    `${title} - ${poetName} جي ${category} شاعري. ${poetry.info || `${title} سنڌي ادب جو وڏو ڪم آهي.`} سنڌي شاعري، ادب، ۽ ثقافت جي مطالعي لاءِ پڙهو.` :
    `${title} - ${category} poetry by ${poetName}. ${poetry.info || `${title} is a significant work in Sindhi literature.`} Read for studying Sindhi poetry, literature, and culture.`
  
  const keywords = generatePoetryKeywords(poetry, lang)
  
  const structuredData = [
    generatePoetryRichSnippets(poetry, lang),
    generatePoetryFAQ(poetry, lang),
    generatePoetryBreadcrumbs(poetry, lang)
  ]
  
  const aiMetaTags = generatePoetryAIMetaTags(poetry, lang)
  
  return {
    title: seoTitle,
    description,
    keywords: keywords.primary,
    structuredData,
    aiMetaTags
  }
}
