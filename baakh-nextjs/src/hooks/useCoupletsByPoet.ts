import { useState, useEffect, useCallback } from 'react';
import { fetchCoupletsByPoet, fetchAllCoupletsByPoet, CoupletsByPoetParams, CoupletsByPoetResponse, Couplet } from '@/lib/api/couplets';

interface UseCoupletsByPoetOptions {
  autoFetch?: boolean;
  initialParams?: CoupletsByPoetParams;
}

interface UseCoupletsByPoetReturn {
  // Data
  couplets: Couplet[];
  poet: any | null;
  pagination: any | null;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCouplets: (params?: Partial<CoupletsByPoetParams>) => Promise<void>;
  fetchAllCouplets: (params?: Partial<CoupletsByPoetParams>) => Promise<void>;
  reset: () => void;
  
  // Pagination helpers
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
}

/**
 * React hook for fetching couplets by poet ID
 * @param poetId - The ID of the poet
 * @param options - Hook options
 * @returns Hook state and actions
 */
export function useCoupletsByPoet(
  poetId: string,
  options: UseCoupletsByPoetOptions = {}
): UseCoupletsByPoetReturn {
  const { autoFetch = true, initialParams } = options;
  
  // State
  const [couplets, setCouplets] = useState<Couplet[]>([]);
  const [poet, setPoet] = useState<any | null>(null);
  const [pagination, setPagination] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Current params state
  const [currentParams, setCurrentParams] = useState<CoupletsByPoetParams>({
    poetId,
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialParams
  });

  // Computed values
  const hasNextPage = pagination ? (currentParams.page || 1) < pagination.totalPages : false;
  const hasPreviousPage = pagination ? (currentParams.page || 1) > 1 : false;

  // Fetch couplets function
  const fetchCouplets = useCallback(async (params?: Partial<CoupletsByPoetParams>) => {
    if (!poetId) return;

    try {
      setLoading(true);
      setError(null);

      const newParams = { ...currentParams, ...params };
      setCurrentParams(newParams);

      const response: CoupletsByPoetResponse = await fetchCoupletsByPoet(newParams);
      
      setCouplets(response.couplets);
      setPoet(response.poet);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch couplets';
      setError(errorMessage);
      console.error('Error fetching couplets:', err);
    } finally {
      setLoading(false);
    }
  }, [poetId, currentParams]);

  // Fetch all couplets function
  const fetchAllCouplets = useCallback(async (params?: Partial<CoupletsByPoetParams>) => {
    if (!poetId) return;

    try {
      setLoading(true);
      setError(null);

      const newParams = { ...currentParams, ...params };
      setCurrentParams(newParams);

      const allCouplets = await fetchAllCoupletsByPoet(newParams);
      
      setCouplets(allCouplets);
      setPoet(null); // No poet info when fetching all
      setPagination({
        page: 1,
        limit: allCouplets.length,
        total: allCouplets.length,
        totalPages: 1
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch all couplets';
      setError(errorMessage);
      console.error('Error fetching all couplets:', err);
    } finally {
      setLoading(false);
    }
  }, [poetId, currentParams]);

  // Pagination helpers
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      fetchCouplets({ page: (currentParams.page || 1) + 1 });
    }
  }, [hasNextPage, currentParams.page, fetchCouplets]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      fetchCouplets({ page: (currentParams.page || 1) - 1 });
    }
  }, [hasPreviousPage, currentParams.page, fetchCouplets]);

  const goToPage = useCallback((page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      fetchCouplets({ page });
    }
  }, [pagination, fetchCouplets]);

  // Reset function
  const reset = useCallback(() => {
    setCouplets([]);
    setPoet(null);
    setPagination(null);
    setLoading(false);
    setError(null);
    setCurrentParams({
      poetId,
      page: 1,
      limit: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
      ...initialParams
    });
  }, [poetId, initialParams]);

  // Auto-fetch on mount and when poetId changes
  useEffect(() => {
    if (autoFetch && poetId) {
      fetchCouplets();
    }
  }, [poetId, autoFetch, fetchCouplets]);

  // Update poetId in currentParams when it changes
  useEffect(() => {
    setCurrentParams(prev => ({ ...prev, poetId }));
  }, [poetId]);

  return {
    // Data
    couplets,
    poet,
    pagination,
    
    // State
    loading,
    error,
    
    // Actions
    fetchCouplets,
    fetchAllCouplets,
    reset,
    
    // Pagination helpers
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage
  };
}
