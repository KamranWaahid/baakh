const isEdgeRuntime = typeof EdgeRuntime !== 'undefined';
let nodeFs = null;
let nodePath = null;

async function ensureNodeModulesLoaded() {
  if (isEdgeRuntime) return false;
  if (!nodeFs || !nodePath) {
    const [{ default: fsMod }, { default: pathMod }] = await Promise.all([
      import('fs'),
      import('path')
    ]);
    nodeFs = fsMod;
    nodePath = pathMod;
  }
  return true;
}

async function getHesudharFilePath() {
  const ok = await ensureNodeModulesLoaded();
  if (!ok) return null;
  return nodePath.join(process.cwd(), 'hesudhar.txt');
}

// Cache for hesudhar corrections
let hesudharCache = null;
let lastFileCheck = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Unicode-aware "word" matcher: letters, marks, numbers, underscore, and common word apostrophes/dashes
const WORD_RE = /[\p{L}\p{M}\p{N}_'\-]+/gu;

/**
 * Normalize text to NFC for stable matching
 * @param {string} text - Input text to normalize
 * @returns {string} Normalized text
 */
function normalize(text) {
  return text.normalize('NFC');
}

/**
 * Replace words in text using the correction map
 * @param {string} inputText - Input text to process
 * @param {Map<string, string>} correctionMap - Map of incorrect words to corrected words
 * @returns {string} Text with words corrected
 */
function replaceWords(inputText, correctionMap) {
  // Replace only "word" tokens; punctuation is untouched
  return inputText.replace(WORD_RE, (token) => {
    const key = normalize(token);
    // Direct match
    if (correctionMap.has(key)) {
      return correctionMap.get(key);
    }
    return token;
  });
}

/**
 * Load hesudhar corrections from local file
 * @returns {Map<string, string>} Map of incorrect words to corrected words
 */
async function loadHesudharCorrections() {
  try {
    if (isEdgeRuntime) {
      return new Map();
    }
    const filePath = await getHesudharFilePath();
    if (!filePath) return new Map();
    // Check if file exists
    if (!nodeFs.existsSync(filePath)) {
      console.warn('⚠️ Hesudhar file not found, using empty corrections');
      return new Map();
    }

    // Check file modification time for cache invalidation
    nodeFs.statSync(filePath);
    const currentTime = Date.now();

    // Return cached data if still valid
    if (hesudharCache && (currentTime - lastFileCheck) < CACHE_DURATION) {
      return hesudharCache;
    }

    // Read and parse file
    const fileContent = nodeFs.readFileSync(filePath, 'utf8');
    const corrections = new Map();

    // Parse each line
    fileContent.split('\n').forEach(line => {
      line = line.trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        return;
      }

      // Parse format: incorrect_word|corrected_word
      const parts = line.split('|');
      if (parts.length === 2) {
        const [incorrect, corrected] = parts;
        if (incorrect && corrected) {
          // Store normalized key for consistent matching
          corrections.set(normalize(incorrect.trim()), corrected.trim());
        }
      }
    });

    // Update cache
    hesudharCache = corrections;
    lastFileCheck = currentTime;

    console.log(`📖 Loaded ${corrections.size} hesudhar corrections from local file`);
    return corrections;

  } catch (error) {
    console.error('❌ Error loading hesudhar corrections:', error.message);
    return new Map();
  }
}

/**
 * Apply hesudhar corrections to text using local file (improved version)
 * @param {string} text - Input text to correct
 * @returns {Object} Object containing corrected text and corrections applied
 */
export function correctHesudharFast(text) {
  if (!text || typeof text !== 'string') {
    return {
      correctedText: text,
      corrections: [],
      message: 'Invalid input text'
    };
  }

  try {
    const corrections = loadHesudharCorrections();
    if (corrections.size === 0) {
      return {
        correctedText: text,
        corrections: [],
        message: 'No hesudhar corrections available'
      };
    }

    // Normalize input text
    const normalizedText = normalize(text);
    
    // Apply word corrections
    const correctedText = replaceWords(normalizedText, corrections);

    // Track which corrections were applied
    const appliedCorrections = [];
    const words = normalizedText.match(WORD_RE) || [];
    
    words.forEach((word, index) => {
      const normalizedWord = normalize(word);
      if (corrections.has(normalizedWord)) {
        appliedCorrections.push({
          incorrectWord: word,
          correctedWord: corrections.get(normalizedWord),
          position: index
        });
      }
    });

    return {
      correctedText,
      corrections: appliedCorrections,
      originalText: text,
      message: appliedCorrections.length > 0 
        ? `Applied ${appliedCorrections.length} corrections` 
        : 'No corrections needed'
    };

  } catch (error) {
    console.error('❌ Error in fast hesudhar correction:', error.message);
    return {
      correctedText: text,
      corrections: [],
      message: 'Error during correction'
    };
  }
}

/**
 * Get hesudhar corrections count
 * @returns {number} Number of available corrections
 */
export function getHesudharCorrectionsCount() {
  const corrections = loadHesudharCorrections();
  return corrections.size;
}

/**
 * Check if a specific word has a correction
 * @param {string} word - Word to check
 * @returns {string|null} Corrected word or null if no correction exists
 */
export function checkWordCorrection(word) {
  const corrections = loadHesudharCorrections();
  return corrections.get(normalize(word)) || null;
}

/**
 * Force refresh of hesudhar cache
 */
export function refreshHesudharCache() {
  hesudharCache = null;
  lastFileCheck = 0;
  console.log('🔄 Hesudhar cache refreshed');
}

