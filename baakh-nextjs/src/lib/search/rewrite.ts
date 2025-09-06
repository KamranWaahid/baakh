// Minimal query rewrite utilities for hybrid search

export type RewrittenQuery = {
  original: string;
  normalized: string;
  lang: 'sd' | 'en';
  script: 'arabic' | 'latin' | 'unknown';
  tokens: string[];
  expansions: string[]; // synonyms and transliterations
  filters: {
    yearRange?: { from: number; to: number };
    theme?: string;
    form?: string;
  };
  pills: string[]; // human-readable applied rewrites
};

const ARABIC_RANGE = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function detectScript(text: string): 'arabic' | 'latin' | 'unknown' {
  if (ARABIC_RANGE.test(text)) return 'arabic';
  if (/[A-Za-z]/.test(text)) return 'latin';
  return 'unknown';
}

export function normalize(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u064B-\u0652]/g, '') // strip Arabic diacritics
    .replace(/[\u200C\u200D]/g, '') // ZWNJ/ZWJ
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Very small synonym set to start with
const THEME_SYNONYMS: Record<string, string[]> = {
  love: ['love', 'ishq', 'mohabbat', 'عشق', 'محبت', 'prem'],
};

const FORM_KEYWORDS = ['ghazal', 'nazm', 'kafi', 'قصيده', 'غزل', 'કાફી', 'ਕਾਫ਼ੀ'];

export function extractCentury(text: string): { from: number; to: number } | undefined {
  // e.g., "17th century", "17th-century", "17th centuries"
  const m = text.match(/(\d{1,2})\s*(st|nd|rd|th)?\s*\-?\s*centur(?:y|ies)/i);
  if (!m) return undefined;
  const c = parseInt(m[1], 10);
  if (!c || c < 1 || c > 21) return undefined;
  const from = (c - 1) * 100 + 1;
  const to = c * 100;
  return { from, to };
}

export function rewriteQuery(q: string, lang: 'sd' | 'en'): RewrittenQuery {
  const script = detectScript(q);
  const normalized = normalize(q);
  const tokens = normalized.split(' ');
  const pills: string[] = [];

  // Century detection
  const yearRange = extractCentury(normalized);
  if (yearRange) pills.push(`${Math.floor((yearRange.from - 1) / 100) + 1}th century`);

  // Theme detection: love
  let theme: string | undefined;
  for (const key of Object.keys(THEME_SYNONYMS)) {
    if (THEME_SYNONYMS[key].some((t) => normalized.includes(t))) {
      theme = key;
      pills.push(lang === 'sd' ? 'موضوع: محبت' : 'theme: love');
      break;
    }
  }

  // Form detection
  let form: string | undefined;
  if (FORM_KEYWORDS.some((k) => normalized.includes(k))) {
    form = 'ghazal';
    pills.push(lang === 'sd' ? 'صنف: غزل' : 'form: ghazal');
  }

  // Expansions
  const expansions = theme ? THEME_SYNONYMS[theme] : [];

  return {
    original: q,
    normalized,
    lang,
    script,
    tokens,
    expansions,
    filters: {
      yearRange,
      theme,
      form,
    },
    pills,
  };
}


