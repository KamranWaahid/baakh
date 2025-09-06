export interface Couplet {
  id: string;
  couplet_text: string;
  couplet_slug: string;
  lang: 'sd' | 'en';
  lines: string[];
  tags: string[];
  poet: {
    name: string;
    slug: string;
    photo: string | null;
  };
  poetry: any | null;
  created_at: string;
  likes: number;
  views: number;
}

export interface Poet {
  id: string;
  slug: string;
  name: string;
  sindhi_name: string;
  english_name: string;
  photo: string | null;
}

export interface CoupletsByPoetResponse {
  couplets: Couplet[];
  poet: Poet;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CoupletsByPoetParams {
  poetId: string;
  page?: number;
  limit?: number;
  lang?: 'sd' | 'en';
  sortBy?: 'created_at' | 'couplet_slug' | 'lang';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch couplets by poet ID from the database
 * @param params - Parameters for fetching couplets
 * @returns Promise<CoupletsByPoetResponse>
 */
export async function fetchCoupletsByPoet(params: CoupletsByPoetParams): Promise<CoupletsByPoetResponse> {
  const {
    poetId,
    page = 1,
    limit = 20,
    lang,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = params;

  // Build query parameters
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder
  });

  if (lang) {
    searchParams.append('lang', lang);
  }

  const response = await fetch(`/api/couplets/by-poet/${poetId}?${searchParams.toString()}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Poet not found');
    }
    throw new Error(`Failed to fetch couplets: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Fetch all couplets by poet ID (with pagination handling)
 * @param params - Parameters for fetching couplets
 * @returns Promise<Couplet[]>
 */
export async function fetchAllCoupletsByPoet(params: Omit<CoupletsByPoetParams, 'page' | 'limit'>): Promise<Couplet[]> {
  const { poetId, lang, sortBy, sortOrder } = params;
  
  let allCouplets: Couplet[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await fetchCoupletsByPoet({
        poetId,
        page: currentPage,
        limit: 100, // Use larger limit to reduce API calls
        lang,
        sortBy,
        sortOrder
      });

      allCouplets = [...allCouplets, ...response.couplets];
      
      // Check if there are more pages
      hasMorePages = currentPage < response.pagination.totalPages;
      currentPage++;
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error);
      break;
    }
  }

  return allCouplets;
}
