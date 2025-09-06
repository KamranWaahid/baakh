import { NextRequest, NextResponse } from 'next/server';

// Basic per-letter transliteration map for Sindhi to Roman
const basicCharMap: Record<string, string> = {
  "ا": "a",
  "آ": "aa",
  "ب": "b",
  "پ": "p",
  "ت": "t",
  "ٹ": "ṭ",
  "ث": "s",
  "ج": "j",
  "چ": "ch",
  "ح": "h",
  "خ": "kh",
  "د": "d",
  "ڊ": "ḍ",
  "ذ": "z",
  "ر": "r",
  "ڙ": "ṛ",
  "ز": "z",
  "ژ": "zh",
  "س": "s",
  "ش": "sh",
  "ص": "s",
  "ض": "z",
  "ط": "t",
  "ظ": "z",
  "ع": "'",
  "غ": "gh",
  "ف": "f",
  "ق": "q",
  "ڪ": "k",
  "ک": "kh",
  "گ": "g",
  "ڳ": "gʻ",
  "ل": "l",
  "م": "m",
  "ن": "n",
  "ڻ": "ṇ",
  "و": "w",
  "ؤ": "o",
  "ه": "h",
  "ھ": "h",
  "ء": "ʼ",
  "ي": "y",
  "ئ": "y",
  "يٰ": "â",
  "ۀ": "e",
  "ئ": "i",
  "ۆ": "o",
  "ۇ": "u",
  "ی": "y",
  "ٔ": "",
};

// Demo dictionary entries for common words
const demoDictionary: Record<string, string> = {
  "ڀٽائي": "Bhittai",
  "سندھ": "Sindh",
  "دل": "dil",
  "محبت": "mohabbat",
  "شاعر": "sha'ir",
  "شاعری": "sha'iri",
  "کلام": "kalam",
  "نظم": "nazm",
  "غزل": "ghazal",
  "قصیدہ": "qasida",
  "رباعی": "rubai",
  "مثنوی": "masnavi",
  "حمد": "hamd",
  "نعت": "naat",
  "مناجات": "munajat",
  "وصف": "wasf",
  "مرثیہ": "marsiya",
  "سلام": "salam",
  "دعا": "dua",
  "حکایت": "hikayat",
};

function smartHesudhar(input: string): { output: string; replacements: number } {
  let replacements = 0;
  const chars = [...input];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === "ه") {
      const prev = chars[i - 1] || " ";
      const next = chars[i + 1] || " ";
      const isLetter = (ch: string) => /[\u0600-\u06FF]/.test(ch);
      if (isLetter(prev) && isLetter(next)) {
        chars[i] = "ھ";
        replacements++;
      }
    }
  }
  return { output: chars.join(""), replacements };
}

function globalHesudhar(input: string): { output: string; replacements: number } {
  const matches = (input.match(/ه/g) || []).length;
  return { output: input.replace(/ه/g, "ھ"), replacements: matches };
}

function transliterateWord(word: string): { roman: string; found: boolean } {
  // Check demo dictionary first
  if (demoDictionary[word]) {
    return { roman: demoDictionary[word], found: true };
  }
  
  // Fall back to per-character mapping
  const roman = [...word]
    .map((c) => basicCharMap[c] ?? c)
    .join("");
  return { roman, found: false };
}

function romanizeText(text: string, mode: 'smart' | 'global' = 'smart'): string {
  // First apply hesudhar
  const hesudharResult = mode === 'global' ? globalHesudhar(text) : smartHesudhar(text);
  
  // Then transliterate to roman
  const tokens = hesudharResult.output.split(/(\s+|[.,!?؛،؛:\-\(\)\[\]{}\"'`])/);
  const romanized = tokens
    .map((tok) => {
      if (/^\s+$/.test(tok) || /[.,!?؛،؛:\-\(\)\[\]{}\"'`]/.test(tok)) {
        return tok; // Keep punctuation and spaces
      }
      const { roman } = transliterateWord(tok);
      return roman;
    })
    .join("");
  
  return romanized;
}

export async function POST(request: NextRequest) {
  try {
    const { text, mode = 'smart', operation = 'romanize' } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (operation === 'hesudhar') {
      // Only perform hesudhar operation
      const result = mode === 'global' ? globalHesudhar(text) : smartHesudhar(text);
      return NextResponse.json({
        original: text,
        hesudhar: result.output,
        replacements: result.replacements,
        mode
      });
    } else if (operation === 'romanize') {
      // Perform full romanization (hesudhar + transliteration)
      const romanized = romanizeText(text, mode);
      return NextResponse.json({
        original: text,
        romanized,
        mode
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid operation. Use "hesudhar" or "romanize"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Romanizer API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Romanizer API endpoint',
    operations: ['hesudhar', 'romanize'],
    modes: ['smart', 'global'],
    features: [
      'Smart hesudhar (context-aware ه to ھ conversion)',
      'Global hesudhar (batch ه to ھ conversion)',
      'Sindhi to Roman transliteration',
      'Demo dictionary for common words',
      'Fallback character mapping'
    ]
  });
}
