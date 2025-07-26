import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Load pending actions from localStorage
    const stored = localStorage.getItem('offline-actions');
    if (stored) {
      setPendingActions(JSON.parse(stored));
    }

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    const updated = [...pendingActions, newAction];
    setPendingActions(updated);
    localStorage.setItem('offline-actions', JSON.stringify(updated));
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    const successful: string[] = [];
    
    for (const action of pendingActions) {
      try {
        // Simulate API call - replace with actual API client
        const response = await fetch(action.endpoint, {
          method: action.type === 'CREATE' ? 'POST' : 
                  action.type === 'UPDATE' ? 'PUT' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: action.type !== 'DELETE' ? JSON.stringify(action.data) : undefined
        });

        if (response.ok) {
          successful.push(action.id);
        }
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }

    // Remove successful actions
    const remaining = pendingActions.filter(action => !successful.includes(action.id));
    setPendingActions(remaining);
    localStorage.setItem('offline-actions', JSON.stringify(remaining));

    // Invalidate queries to refresh data
    if (successful.length > 0) {
      queryClient.invalidateQueries();
    }
  };

  const clearPendingActions = () => {
    setPendingActions([]);
    localStorage.removeItem('offline-actions');
  };

  return {
    isOnline,
    pendingActions,
    addOfflineAction,
    syncPendingActions,
    clearPendingActions,
    hasPendingActions: pendingActions.length > 0
  };
};