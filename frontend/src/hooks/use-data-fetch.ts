/**
 * Custom hook for handling pagination and filtering logic
 * Reduces boilerplate and ensures consistent behavior across pages
 */

import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  totalPages: number;
  isLoading: boolean;
}

export interface UseDataFetchProps<T> {
  fetchFn: (page: number, filters: T) => Promise<{ data: any[]; totalPages: number }>;
  onError?: (error: Error) => void;
}

export function useDataFetch<T extends Record<string, any>>({
  fetchFn,
  onError,
}: UseDataFetchProps<T>) {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    totalPages: 1,
    isLoading: true,
  });

  const load = useCallback(
    async (filters: T) => {
      setPagination((p) => ({ ...p, isLoading: true }));
      try {
        const result = await fetchFn(pagination.page, filters);
        setData(result.data);
        setPagination((p) => ({ ...p, totalPages: result.totalPages }));
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setPagination((p) => ({ ...p, isLoading: false }));
      }
    },
    [fetchFn, pagination.page, onError]
  );

  const setPage = useCallback((newPage: number) => {
    setPagination((p) => ({
      ...p,
      page: Math.max(1, Math.min(newPage, p.totalPages)),
    }));
  }, []);

  return {
    data,
    ...pagination,
    setPage,
    load,
  };
}
