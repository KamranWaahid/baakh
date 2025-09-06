/**
 * Utility functions for handling poet names and laqabs consistently
 * Prioritizes laqab names over regular names throughout the application
 */

export interface PoetNameData {
  name?: string;
  sindhiName?: string;
  englishName?: string;
  sindhi_laqab?: string;
  sindhiLaqab?: string;
  english_laqab?: string;
  englishLaqab?: string;
  display_name?: string;
  display_laqab?: string;
}

/**
 * Get the primary display name for a poet (prioritizes laqab)
 * @param poet - Poet data object
 * @param isSindhi - Whether the current locale is Sindhi
 * @returns The primary name to display (laqab if available, otherwise regular name)
 */
export const getPrimaryPoetName = (poet: PoetNameData, isSindhi: boolean): string => {
  // First priority: display_laqab (if explicitly set)
  if (poet.display_laqab) {
    return poet.display_laqab;
  }

  // Second priority: laqab based on locale
  if (isSindhi) {
    if (poet.sindhi_laqab) return poet.sindhi_laqab;
    if (poet.sindhiLaqab) return poet.sindhiLaqab;
  } else {
    if (poet.english_laqab) return poet.english_laqab;
    if (poet.englishLaqab) return poet.englishLaqab;
  }

  // Third priority: display_name (if explicitly set)
  if (poet.display_name) {
    return poet.display_name;
  }

  // Fourth priority: regular name based on locale
  if (isSindhi) {
    return poet.sindhiName || poet.englishName || poet.name || 'Unknown Poet';
  } else {
    return poet.englishName || poet.sindhiName || poet.name || 'Unknown Poet';
  }
};

/**
 * Get the secondary display name for a poet (regular name when laqab is primary)
 * @param poet - Poet data object
 * @param isSindhi - Whether the current locale is Sindhi
 * @returns The secondary name to display (regular name if laqab is primary)
 */
export const getSecondaryPoetName = (poet: PoetNameData, isSindhi: boolean): string | null => {
  // Get the primary name
  const primaryName = getPrimaryPoetName(poet, isSindhi);
  
  // Get the regular name for the current locale
  const regularName = isSindhi 
    ? (poet.sindhiName || poet.englishName || poet.name)
    : (poet.englishName || poet.sindhiName || poet.name);

  // If primary name is a laqab and different from regular name, return regular name
  const isLaqabPrimary = poet.display_laqab || 
    (isSindhi ? (poet.sindhi_laqab || poet.sindhiLaqab) : (poet.english_laqab || poet.englishLaqab));
  
  if (isLaqabPrimary && primaryName !== regularName && regularName) {
    return regularName;
  }

  // If primary name is regular name, check if there's an alternate language name
  if (primaryName === regularName) {
    const alternateName = isSindhi 
      ? poet.englishName 
      : poet.sindhiName;
    
    if (alternateName && alternateName !== primaryName) {
      return alternateName;
    }
  }

  return null;
};

/**
 * Get the display name for avatar fallback (first character)
 * @param poet - Poet data object
 * @param isSindhi - Whether the current locale is Sindhi
 * @returns The name to use for avatar fallback
 */
export const getAvatarPoetName = (poet: PoetNameData, isSindhi: boolean): string => {
  return getPrimaryPoetName(poet, isSindhi);
};

/**
 * Check if a poet has a laqab name
 * @param poet - Poet data object
 * @param isSindhi - Whether the current locale is Sindhi
 * @returns True if the poet has a laqab name
 */
export const hasLaqabName = (poet: PoetNameData, isSindhi: boolean): boolean => {
  if (poet.display_laqab) return true;
  
  if (isSindhi) {
    return !!(poet.sindhi_laqab || poet.sindhiLaqab);
  } else {
    return !!(poet.english_laqab || poet.englishLaqab);
  }
};
