// AI Search Engine Optimization for Perplexity, ChatGPT, and other AI tools

export interface AISearchContext {
  content_type: 'poet' | 'poetry' | 'category' | 'couplet' | 'topic'
  language: 'sindhi' | 'english'
  cultural_context: string
  literary_period: string
  themes: string[]
  related_concepts: string[]
  search_intent: string[]
  content_quality: 'high' | 'medium' | 'low'
  authority_score: number
  freshness_score: number
  relevance_keywords: string[]
}

export interface PoetAIContext extends AISearchContext {
  content_type: 'poet'
  birth_period?: string
  death_period?: string
  literary_style: string[]
  famous_works: string[]
  influence_on: string[]
  influenced_by: string[]
  awards_recognition: string[]
  cultural_impact: string
}

export interface PoetryAIContext extends AISearchContext {
  content_type: 'poetry'
  genre: string
  author: string
  publication_period: string
  literary_techniques: string[]
  emotional_themes: string[]
  cultural_references: string[]
  linguistic_features: string[]
  meter_rhythm: string
  symbolism: string[]
}

// Generate AI search context for poets
export function generatePoetAIContext(poet: any, lang: 'sd' | 'en'): PoetAIContext {
  const isSindhi = lang === 'sd'
  const name = isSindhi ? poet.sindhi_name : poet.english_name
  
  return {
    content_type: 'poet',
    language: isSindhi ? 'sindhi' : 'english',
    cultural_context: 'Sindhi Literature and Culture',
    literary_period: determineLiteraryPeriod(poet.birth_year, poet.death_year),
    themes: isSindhi ? [
      'محبت',
      'وطن پرستي',
      'مذہب',
      'فلسفہ',
      'طبيعت',
      'انسانيت',
      'سماجي مسائل',
      'تاريخ'
    ] : [
      'Love',
      'Patriotism',
      'Religion',
      'Philosophy',
      'Nature',
      'Humanity',
      'Social Issues',
      'History'
    ],
    related_concepts: isSindhi ? [
      'سنڌي شاعري',
      'سنڌي ادب',
      'شعر',
      'نظم',
      'غزل',
      'سنڌي ثقافت',
      'سنڌي زبان',
      'سنڌي تاريخ'
    ] : [
      'Sindhi Poetry',
      'Sindhi Literature',
      'Couplets',
      'Nazam',
      'Ghazal',
      'Sindhi Culture',
      'Sindhi Language',
      'Sindhi History'
    ],
    search_intent: [
      'Learn about Sindhi poets',
      'Study Sindhi literature',
      'Understand cultural context',
      'Explore literary works',
      'Research historical figures'
    ],
    content_quality: poet.is_featured ? 'high' : 'medium',
    authority_score: calculateAuthorityScore(poet),
    freshness_score: calculateFreshnessScore(poet.updated_at || poet.created_at),
    relevance_keywords: generateRelevanceKeywords(poet, isSindhi),
    birth_period: poet.birth_year ? getPeriodFromYear(poet.birth_year) : undefined,
    death_period: poet.death_year ? getPeriodFromYear(poet.death_year) : undefined,
    literary_style: isSindhi ? [
      'روحاني شاعري',
      'مذہبي شاعري',
      'وطن پرستي شاعري',
      'محبتي شاعري',
      'فلسفي شاعري'
    ] : [
      'Spiritual Poetry',
      'Religious Poetry',
      'Patriotic Poetry',
      'Love Poetry',
      'Philosophical Poetry'
    ],
    famous_works: [], // Would be populated from database
    influence_on: isSindhi ? [
      'نئين نسل جا شاعر',
      'سنڌي ادب',
      'سنڌي ثقافت'
    ] : [
      'New Generation Poets',
      'Sindhi Literature',
      'Sindhi Culture'
    ],
    influenced_by: isSindhi ? [
      'مشهور سنڌي شاعر',
      'فارسي شاعري',
      'عربي ادب',
      'اردو شاعري'
    ] : [
      'Famous Sindhi Poets',
      'Persian Poetry',
      'Arabic Literature',
      'Urdu Poetry'
    ],
    awards_recognition: poet.is_featured ? (isSindhi ? ['مشهور شاعر'] : ['Featured Poet']) : [],
    cultural_impact: isSindhi ? 
      `${name} سنڌي ثقافت ۽ ادب تي وڏو اثر رکيو آهي` :
      `${name} has had a significant impact on Sindhi culture and literature`
  }
}

// Generate AI search context for poetry
export function generatePoetryAIContext(poetry: any, lang: 'sd' | 'en'): PoetryAIContext {
  const isSindhi = lang === 'sindhi'
  const title = poetry.title
  const poetName = isSindhi ? poetry.poet.sindhi_name : poetry.poet.english_name
  
  return {
    content_type: 'poetry',
    language: isSindhi ? 'sindhi' : 'english',
    cultural_context: 'Sindhi Literature and Culture',
    literary_period: determineLiteraryPeriod(poetry.poet.birth_year, poetry.poet.death_year),
    themes: extractThemesFromPoetry(poetry, isSindhi),
    related_concepts: isSindhi ? [
      'سنڌي شاعري',
      'شعر',
      'نظم',
      'غزل',
      'سنڌي ادب',
      'سنڌي ثقافت'
    ] : [
      'Sindhi Poetry',
      'Couplets',
      'Nazam',
      'Ghazal',
      'Sindhi Literature',
      'Sindhi Culture'
    ],
    search_intent: [
      'Read Sindhi poetry',
      'Study literary techniques',
      'Understand cultural context',
      'Analyze poetic themes',
      'Explore linguistic features'
    ],
    content_quality: poetry.is_featured ? 'high' : 'medium',
    authority_score: calculateAuthorityScore(poetry.poet),
    freshness_score: calculateFreshnessScore(poetry.updated_at || poetry.created_at),
    relevance_keywords: generatePoetryRelevanceKeywords(poetry, isSindhi),
    genre: poetry.category.name,
    author: poetName,
    publication_period: getPeriodFromYear(new Date(poetry.created_at).getFullYear()),
    literary_techniques: isSindhi ? [
      'استعارہ',
      'تشبيه',
      'تضاد',
      'تکرار',
      'سوال و جواب'
    ] : [
      'Metaphor',
      'Simile',
      'Contrast',
      'Repetition',
      'Question and Answer'
    ],
    emotional_themes: extractEmotionalThemes(poetry, isSindhi),
    cultural_references: extractCulturalReferences(poetry, isSindhi),
    linguistic_features: isSindhi ? [
      'سنڌي زبان',
      'عربي الفاظ',
      'فارسي الفاظ',
      'مقامي زبان',
      'شاعري زبان'
    ] : [
      'Sindhi Language',
      'Arabic Words',
      'Persian Words',
      'Local Language',
      'Poetic Language'
    ],
    meter_rhythm: determineMeterRhythm(poetry.category.slug),
    symbolism: extractSymbolism(poetry, isSindhi)
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

function getPeriodFromYear(year: number): string {
  if (year < 1800) return 'Classical Era'
  if (year < 1900) return 'Pre-Modern Era'
  if (year < 1950) return 'Modern Era'
  if (year < 1980) return 'Contemporary Era'
  return 'Post-Contemporary Era'
}

function calculateAuthorityScore(poet: any): number {
  let score = 0.5 // Base score
  
  if (poet.is_featured) score += 0.3
  if (poet.poetry_count > 10) score += 0.1
  if (poet.couplets_count > 50) score += 0.1
  if (poet.sindhi_details && poet.sindhi_details.length > 100) score += 0.1
  
  return Math.min(score, 1.0)
}

function calculateFreshnessScore(lastModified: string): number {
  const now = new Date()
  const modified = new Date(lastModified)
  const daysDiff = (now.getTime() - modified.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysDiff < 30) return 1.0
  if (daysDiff < 90) return 0.8
  if (daysDiff < 365) return 0.6
  return 0.4
}

function generateRelevanceKeywords(poet: any, isSindhi: boolean): string[] {
  const baseKeywords = isSindhi ? [
    'سنڌي شاعر',
    'سنڌي شاعري',
    'سنڌي ادب',
    'شعر',
    'نظم',
    'غزل'
  ] : [
    'Sindhi poet',
    'Sindhi poetry',
    'Sindhi literature',
    'couplets',
    'nazam',
    'ghazal'
  ]
  
  const specificKeywords = []
  if (poet.sindhi_laqab) specificKeywords.push(isSindhi ? poet.sindhi_laqab : poet.english_laqab)
  if (poet.is_featured) specificKeywords.push(isSindhi ? 'مشهور شاعر' : 'famous poet')
  
  return [...baseKeywords, ...specificKeywords]
}

function generatePoetryRelevanceKeywords(poetry: any, isSindhi: boolean): string[] {
  const baseKeywords = isSindhi ? [
    'سنڌي شاعري',
    'شعر',
    'نظم',
    'غزل',
    'سنڌي ادب'
  ] : [
    'Sindhi poetry',
    'couplets',
    'nazam',
    'ghazal',
    'Sindhi literature'
  ]
  
  return [...baseKeywords, poetry.title, poetry.category.name]
}

function extractThemesFromPoetry(poetry: any, isSindhi: boolean): string[] {
  // This would analyze the poetry content to extract themes
  // For now, return common themes based on category
  const categoryThemes: Record<string, string[]> = {
    'ghazal': isSindhi ? ['محبت', 'روحانيت', 'فلسفہ'] : ['Love', 'Spirituality', 'Philosophy'],
    'nazam': isSindhi ? ['وطن پرستي', 'سماجي مسائل', 'تاريخ'] : ['Patriotism', 'Social Issues', 'History'],
    'rubai': isSindhi ? ['فلسفہ', 'حکمت', 'زندگي'] : ['Philosophy', 'Wisdom', 'Life']
  }
  
  return categoryThemes[poetry.category.slug] || (isSindhi ? ['عمومي موضوعات'] : ['General Themes'])
}

function extractEmotionalThemes(poetry: any, isSindhi: boolean): string[] {
  return isSindhi ? [
    'محبت',
    'غم',
    'خوشي',
    'اميد',
    'ياد',
    'فخر'
  ] : [
    'Love',
    'Sorrow',
    'Joy',
    'Hope',
    'Memory',
    'Pride'
  ]
}

function extractCulturalReferences(poetry: any, isSindhi: boolean): string[] {
  return isSindhi ? [
    'سنڌي ثقافت',
    'سنڌي تاريخ',
    'سنڌي رواج',
    'مذہبي عقائد',
    'مقامي رسم'
  ] : [
    'Sindhi Culture',
    'Sindhi History',
    'Sindhi Traditions',
    'Religious Beliefs',
    'Local Customs'
  ]
}

function determineMeterRhythm(categorySlug: string): string {
  const meterMap: Record<string, string> = {
    'ghazal': 'AABA pattern with specific meter',
    'nazam': 'Free verse or structured meter',
    'rubai': 'AABA quatrain pattern',
    'qasida': 'Long structured poem with consistent meter'
  }
  
  return meterMap[categorySlug] || 'Traditional Sindhi meter'
}

function extractSymbolism(poetry: any, isSindhi: boolean): string[] {
  return isSindhi ? [
    'طبيعت جا نشان',
    'مذہبي علامات',
    'ثقافتي نشان',
    'تاريخي حوالا'
  ] : [
    'Natural Symbols',
    'Religious Symbols',
    'Cultural Symbols',
    'Historical References'
  ]
}

// Generate AI-optimized meta tags
export function generateAIMetaTags(context: AISearchContext): Record<string, string> {
  return {
    'ai:content_type': context.content_type,
    'ai:language': context.language,
    'ai:cultural_context': context.cultural_context,
    'ai:literary_period': context.literary_period,
    'ai:themes': context.themes.join(', '),
    'ai:related_concepts': context.related_concepts.join(', '),
    'ai:search_intent': context.search_intent.join(', '),
    'ai:content_quality': context.content_quality,
    'ai:authority_score': context.authority_score.toString(),
    'ai:freshness_score': context.freshness_score.toString(),
    'ai:relevance_keywords': context.relevance_keywords.join(', ')
  }
}

// Generate structured data for AI search engines
export function generateAIStructuredData(context: AISearchContext): any {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "inLanguage": context.language,
    "about": {
      "@type": "Thing",
      "name": context.cultural_context
    },
    "keywords": context.relevance_keywords.join(', '),
    "audience": {
      "@type": "Audience",
      "audienceType": "Literature Enthusiasts"
    },
    "genre": context.content_type,
    "educationalLevel": "General",
    "learningResourceType": "Literary Work",
    "teaches": context.themes,
    "isBasedOn": context.related_concepts.map(concept => ({
      "@type": "Thing",
      "name": concept
    }))
  }
}
