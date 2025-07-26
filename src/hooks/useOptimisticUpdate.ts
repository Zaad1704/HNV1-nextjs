import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useOptimisticUpdate = <T>(queryKey: string[], initialData: T[]) => {
  const queryClient = useQueryClient();
  const [optimisticData, setOptimisticData] = useState<T[]>(initialData);

  const addOptimistic = useCallback((newItem: T) => {
    setOptimisticData(prev => [...prev, newItem]);
    queryClient.setQueryData(queryKey, (old: any) => [...(old || []), newItem]);
  }, [queryClient, queryKey]);

  const updateOptimistic = useCallback((id: string, updatedItem: Partial<T>) => {
    setOptimisticData(prev => 
      prev.map(item => 
        (item as any)._id === id ? { ...item, ...updatedItem } : item
      )
    );
    queryClient.setQueryData(queryKey, (old: any) => 
      (old || []).map((item: any) => 
        item._id === id ? { ...item, ...updatedItem } : item
      )
    );
  }, [queryClient, queryKey]);

  const removeOptimistic = useCallback((id: string) => {
    setOptimisticData(prev => prev.filter(item => (item as any)._id !== id));
    queryClient.setQueryData(queryKey, (old: any) => 
      (old || []).filter((item: any) => item._id !== id)
    );
  }, [queryClient, queryKey]);

  const revertOptimistic = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    optimisticData,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    revertOptimistic
  };
};