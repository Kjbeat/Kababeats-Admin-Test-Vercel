import { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { apiService } from '@/services/api';
import { Beat, BeatFilters, AdvancedBeatFilters } from '@/types';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached responses

interface CacheEntry {
  data: any;
  timestamp: number;
  params: string;
}

interface BeatResponse {
  success: boolean;
  data?: Beat[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: {
    message: string;
  };
}

// In-memory cache
const cache = new Map<string, CacheEntry>();

// Request deduplication
const pendingRequests = new Map<string, Promise<BeatResponse>>();

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Generate cache key from query parameters
function generateCacheKey(params: BeatFilters): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key as keyof BeatFilters];
      return result;
    }, {} as Record<string, any>);
  
  return JSON.stringify(sortedParams);
}

// Map frontend sort values to backend expected values
function mapFrontendSortToBackend(frontendSort: string): string {
  const sortMapping: Record<string, string> = {
    'newest': 'createdAt',
    'oldest': 'createdAt',
    'popular': 'plays',
    'plays': 'plays',
    'likes': 'likes',
    'title': 'title',
    'producer': 'owner',
    'genre': 'genre',
    'price-low': 'price',
    'price-high': 'price'
  };
  
  return sortMapping[frontendSort] || 'createdAt';
}

// Clean expired cache entries
function cleanCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
  
  // If cache is still too large, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, cache.size - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => cache.delete(key));
  }
}

// Fetch beats with caching and deduplication
async function fetchBeatsWithCache(params: BeatFilters): Promise<BeatResponse> {
  const cacheKey = generateCacheKey(params);
  console.log('fetchBeatsWithCache: Cache key:', cacheKey);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('fetchBeatsWithCache: Using cached data');
    return cached.data;
  }
  
  // Check if request is already pending
  if (pendingRequests.has(cacheKey)) {
    console.log('fetchBeatsWithCache: Using pending request');
    return pendingRequests.get(cacheKey)!;
  }
  
  console.log('fetchBeatsWithCache: Making new API request');
  // Create new request
  const requestPromise = (async (): Promise<BeatResponse> => {
    try {
      console.log('fetchBeatsWithCache: Calling apiService.get with params:', params);
      const response = await apiService.get('/beats', params);
      console.log('fetchBeatsWithCache: API response received:', response);
      
      // Cache successful response
      cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
        params: cacheKey
      });

      // Clean cache periodically
      if (Math.random() < 0.1) { // 10% chance to clean cache
        cleanCache();
      }

      return response as BeatResponse;
    } catch (error) {
      console.error('fetchBeatsWithCache: Error fetching beats:', error);
      throw error;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
}

export function useAdvancedBeats(initialAdvancedParams?: AdvancedBeatFilters) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Query parameters - we keep the internal state as BeatFilters for API calls
  const [queryParams, setQueryParams] = useState<BeatFilters>({
    search: '',
    genre: undefined,
    status: undefined,
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Debounced search query
  const debouncedSearchQuery = useDebounce(queryParams.search || '', 500);
  
  // Update query params when debounced search changes
  useEffect(() => {
    setQueryParams(prev => ({
      ...prev,
      search: debouncedSearchQuery || undefined
    }));
  }, [debouncedSearchQuery]);

  const { toast } = useToast();

  // Fetch beats function with retry logic
  const fetchBeats = useCallback(async (page: number = 1, reset: boolean = false, retryAttempt: number = 0) => {
    try {
      if (reset) {
        setIsLoading(true);
        setError(null);
        setRetryCount(0);
      } else {
        setIsLoadingMore(true);
      }

      // Map frontend parameters to backend BeatFilters
      const backendParams: BeatFilters = {
        search: queryParams.search,
        genre: queryParams.genre,
        status: queryParams.status, 
        page,
        limit: queryParams.limit || 50,
        sortBy: mapFrontendSortToBackend(queryParams.sortBy || 'createdAt'),
        sortOrder: queryParams.sortOrder || 'desc'
      };

      console.log('useAdvancedBeats: Fetching with backend params:', backendParams);
      const response = await fetchBeatsWithCache(backendParams);
      console.log('useAdvancedBeats: API response:', response);
      
      // The API service already extracts the data property, so response should be the full response
      const newBeats = response?.data || [];
      console.log('useAdvancedBeats: Extracted beats:', newBeats.length, newBeats);
      
      if (reset) {
        setBeats(newBeats);
        console.log('useAdvancedBeats: Set beats (reset):', newBeats.length);
      } else {
        setBeats(prev => [...prev, ...newBeats]);
        console.log('useAdvancedBeats: Set beats (append):', newBeats.length);
      }
      
      setCurrentPage(page);
      setTotalPages(response?.pagination?.pages || 1);
      setHasMore(page < (response?.pagination?.pages || 1));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch beats';
      
      // Retry logic
      if (retryAttempt < 3) {
        const delay = Math.pow(2, retryAttempt) * 1000; // Exponential backoff
        setTimeout(() => {
          fetchBeats(page, reset, retryAttempt + 1);
        }, delay);
        return;
      }
      
      setError(errorMessage);
      setRetryCount(retryAttempt);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [queryParams, toast]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    await fetchBeats(currentPage + 1, false);
  }, [isLoadingMore, hasMore, currentPage, isLoading, fetchBeats]);

  // Reset and fetch first page
  const resetAndFetch = useCallback(async () => {
    setCurrentPage(1);
    setHasMore(true);
    await fetchBeats(1, true);
  }, [fetchBeats]);

  // Update query parameters from advanced filters
  const updateFromAdvancedFilters = useCallback((advancedFilters: Partial<AdvancedBeatFilters>) => {
    const backendFilters: Partial<BeatFilters> = {
      search: advancedFilters.search,
      genre: advancedFilters.genre,
      // Note: mood is not supported by backend, it will be filtered on frontend
      sortBy: mapFrontendSortToBackend(advancedFilters.sortBy || 'newest'),
      sortOrder: advancedFilters.sortOrder || 'desc'
    };
    
    setQueryParams(prev => ({ ...prev, ...backendFilters }));
  }, []);

  // Update query parameters
  const updateQueryParams = useCallback((updates: Partial<BeatFilters>) => {
    setQueryParams(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setQueryParams({
      search: '',
      genre: undefined,
      status: undefined,
      page: 1,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }, []);

  // Retry function
  const retry = useCallback(() => {
    setError(null);
    fetchBeats(currentPage, true);
  }, [fetchBeats, currentPage]);

  // Initial fetch on mount
  useEffect(() => {
    resetAndFetch();
  }, []); // Empty dependency array for initial fetch only

  // Auto-fetch when query params change (except for search which is debounced)
  useEffect(() => {
    if (queryParams.search === debouncedSearchQuery) {
      resetAndFetch();
    }
  }, [queryParams.genre, queryParams.status, queryParams.sortBy, queryParams.sortOrder, queryParams.search, debouncedSearchQuery]);

  // Computed values
  const activeFilters = useMemo(() => {
    const filters = [];
    if (queryParams.search) filters.push(`Search: ${queryParams.search}`);
    if (queryParams.genre) filters.push(`Genre: ${queryParams.genre}`);
    if (queryParams.status) filters.push(`Status: ${queryParams.status}`);
    return filters;
  }, [queryParams]);

  return {
    // Data
    beats,
    isLoading,
    isLoadingMore,
    hasMore,
    currentPage,
    totalPages,
    error,
    retryCount,
    activeFilters,
    
    // Query parameters
    queryParams,
    
    // Actions
    fetchBeats,
    loadMore,
    resetAndFetch,
    updateQueryParams,
    updateFromAdvancedFilters,
    clearAllFilters,
    retry,
    
    // Utilities
    setBeats
  };
}
