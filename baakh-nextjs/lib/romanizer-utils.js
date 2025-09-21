import fs from 'fs';
import path from 'path';

const ROMANIZER_FILE_PATH = path.join(process.cwd(), 'romanizer.txt');

// Cache for romanizer mappings
let romanizerCache = null;
let lastFileCheck = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the romanizer cache to force reload
 */
export function clearRomanizerCache() {
  romanizerCache = null;
  lastFileCheck = 0;
  console.log('🧹 Romanizer cache cleared');
}

// Unicode-aware "word" matcher: letters, marks, numbers, underscore, and common word apostrophes/dashes
// This regex matches words but excludes parentheses and other punctuation
// const WORD_RE = /[\p{L}\p{M}\p{N}_''--]+/gu; // Commented out as it's not used

// Better word boundary detection that separates words from punctuation
// This regex matches letters, marks, numbers, and symbols (for Sindhi characters like ۾)
const CLEAN_WORD_RE = /[\p{L}\p{M}\p{N}\p{S}]+/gu;

// Sindhi → English punctuation map for global replacement
const PUNCT_MAP = {
  '،': ',',
  '؛': ';',
  '؟': '?',
  '"': '"',
  '"': '"',
  '۔': '.', // Urdu full stop
  '…': '...',
  '–': '-',
  '—': '--',
};

// Build a single regex to replace all mapped punctuations globally
const PUNCT_FIND_RE = new RegExp(
  `[${Object.keys(PUNCT_MAP).map(ch => `\\u${ch.codePointAt(0).toString(16).padStart(4,'0')}`).join('')}]`,
  'gu'
);

/**
 * Normalize text to NFC for stable matching
 * @param {string} text - Input text to normalize
 * @returns {string} Normalized text
 */
function normalize(text) {
  return text.normalize('NFC');
}

/**
 * Replace Sindhi punctuation with English equivalents
 * @param {string} text - Input text
 * @returns {string} Text with normalized punctuation
 */
function replaceSindhiPunctuation(text) {
  return text.replace(PUNCT_FIND_RE, ch => PUNCT_MAP[ch] || ch);
}

/**
 * Replace words in text using the replacement map
 * @param {string} inputText - Input text to process
 * @param {Map<string, string>} replacementMap - Map of Sindhi words to romanized words
 * @returns {string} Text with words replaced
 */
function replaceWords(inputText, replacementMap) {
  // Use cleaner word detection that properly separates words from punctuation
  return inputText.replace(CLEAN_WORD_RE, (word) => {
    const key = normalize(word);
    // Direct match
    if (replacementMap.has(key)) {
      return replacementMap.get(key);
    }
    return word;
  });
}

/**
 * Generate a clean slug from text
 * @param {string} text - Input text
 * @returns {string} Clean slug
 */
function toSlug(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{M}\p{N} _-]+/gu, '') // Drop stray punctuation for slugs
    .replace(/\s+/g, '-')                     // Spaces → dash
    .replace(/-+/g, '-')                      // Collapse multiple dashes
    .toLowerCase();
}

/**
 * Load romanizer mappings from local file
 * @returns {Map<string, string>} Map of Sindhi words to romanized words
 */
function loadRomanizerMappings() {
  try {
    // Check if file exists
    if (!fs.existsSync(ROMANIZER_FILE_PATH)) {
      console.warn('⚠️ Romanizer file not found, using empty mappings');
      return new Map();
    }

    // Check file modification time for cache invalidation
    const stats = fs.statSync(ROMANIZER_FILE_PATH);
    const currentTime = Date.now();

    // Return cached data if still valid
    if (romanizerCache && (currentTime - lastFileCheck) < CACHE_DURATION) {
      return romanizerCache;
    }

    // Read and parse file
    const fileContent = fs.readFileSync(ROMANIZER_FILE_PATH, 'utf8');
    const mappings = new Map();

    // Parse each line
    fileContent.split('\n').forEach(line => {
      line = line.trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        return;
      }

      // Parse format: sindhi_word|roman_word
      const parts = line.split('|');
      if (parts.length === 2) {
        const [sindhi, roman] = parts;
        if (sindhi && roman) {
          // Store normalized key for consistent matching
          mappings.set(normalize(sindhi.trim()), roman.trim());
        }
      }
    });

    // Update cache
    romanizerCache = mappings;
    lastFileCheck = currentTime;

    console.log(`📖 Loaded ${mappings.size} romanizer mappings from local file`);
    return mappings;

  } catch (error) {
    console.error('❌ Error loading romanizer mappings:', error.message);
    return new Map();
  }
}

/**
 * Apply romanization to text using local file (improved version)
 * @param {string} text - Input Sindhi text to romanize
 * @returns {Object} Object containing romanized text and mappings used
 */
export function romanizeTextFast(text) {
  if (!text || typeof text !== 'string') {
    return {
      romanizedText: text,
      mappings: [],
      message: 'Invalid input text'
    };
  }

  try {
    const mappings = loadRomanizerMappings();
    if (mappings.size === 0) {
      return {
        romanizedText: text,
        mappings: [],
        message: 'No romanizer mappings available'
      };
    }

    // Normalize input text
    const normalizedText = normalize(text);
    
    // Apply word replacements first
    const replacedText = replaceWords(normalizedText, mappings);
    
    // Then normalize punctuation
    const finalText = replaceSindhiPunctuation(replacedText);

    // Track which mappings were applied
    const appliedMappings = [];
    const words = normalizedText.match(CLEAN_WORD_RE) || [];
    
    words.forEach((word, index) => {
      const normalizedWord = normalize(word);
      if (mappings.has(normalizedWord)) {
        appliedMappings.push({
          sindhiWord: word,
          romanWord: mappings.get(normalizedWord),
          position: index
        });
      }
    });

    return {
      romanizedText: finalText,
      mappings: appliedMappings,
      originalText: text,
      message: appliedMappings.length > 0 
        ? `Applied ${appliedMappings.length} romanizations` 
        : 'No romanizations found'
    };

  } catch (error) {
    console.error('❌ Error in fast romanization:', error.message);
    return {
      romanizedText: text,
      mappings: [],
      message: 'Error during romanization'
    };
  }
}

/**
 * Generate a romanized slug from text
 * @param {string} text - Input Sindhi text
 * @returns {string} Romanized slug
 */
export function romanizeTextToSlug(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  try {
    const mappings = loadRomanizerMappings();
    if (mappings.size === 0) {
      return toSlug(text);
    }

    // Take first line for slug generation
    const firstLine = text.split('\n')[0] || '';
    
    // Normalize and replace words
    const normalizedLine = normalize(firstLine);
    const replaced = replaceWords(normalizedLine, mappings);
    
    // Fix punctuation and generate slug
    const punctFixed = replaceSindhiPunctuation(replaced);
    return toSlug(punctFixed);

  } catch (error) {
    console.error('❌ Error generating slug:', error.message);
    return toSlug(text);
  }
}

/**
 * Get romanizer mappings count
 * @returns {number} Number of available mappings
 */
export function getRomanizerMappingsCount() {
  const mappings = loadRomanizerMappings();
  return mappings.size;
}

/**
 * Check if a specific word has a romanization
 * @param {string} word - Word to check
 * @returns {string|null} Romanized word or null if no mapping exists
 */
export function checkWordRomanization(word) {
  const mappings = loadRomanizerMappings();
  return mappings.get(normalize(word)) || null;
}

/**
 * Force refresh of romanizer cache
 */
export function refreshRomanizerCache() {
  romanizerCache = null;
  lastFileCheck = 0;
  console.log('🔄 Romanizer cache refreshed');
}
