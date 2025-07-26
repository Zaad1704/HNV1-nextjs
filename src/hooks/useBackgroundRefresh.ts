import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useBackgroundRefresh = (queryKeys: string[][], interval: number = 30000) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refreshData = () => {
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };

    const intervalId = setInterval(refreshData, interval);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient, queryKeys, interval]);
};