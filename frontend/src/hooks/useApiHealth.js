import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth } from '../services/api';

/**
 * Custom React Hook to monitor NetGuard AI API health status.
 */
export function useApiHealth() {
  const [healthState, setHealthState] = useState({
    isConnected: false,
    data: null,
    loading: true,
    error: null,
  });

  const checkHealth = useCallback(async () => {
    setHealthState((prev) => ({ ...prev, loading: true }));
    const result = await checkBackendHealth();
    setHealthState({
      isConnected: result.connected,
      data: result.data,
      loading: false,
      error: result.error,
    });
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    ...healthState,
    refresh: checkHealth,
  };
}

export default useApiHealth;
