import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useDebounce } from './useDebounce';

interface SearchResult {
  id: string;
  type: 'property' | 'tenant' | 'payment' | 'expense';
  title: string;
  subtitle?: string;
  url: string;
  metadata?: Record<string, any>;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export const useGlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: async (): Promise<SearchResponse> => {
      if (!debouncedQuery.trim()) {
        return { results: [], total: 0, query: debouncedQuery };
      }
      
      const { data } = await apiClient.get(`/search`, {
        params: { q: debouncedQuery, limit: 10 }
      });
      
      return data.data;
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  const results = useMemo(() => data?.results || [], [data]);
  
  const clearSearch = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    clearSearch();
    // Navigation will be handled by the component using this hook
  }, [clearSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading: isLoading && debouncedQuery.length >= 2,
    error,
    isOpen,
    setIsOpen,
    clearSearch,
    handleResultClick,
    hasResults: results.length > 0,
    total: data?.total || 0
  };
};

