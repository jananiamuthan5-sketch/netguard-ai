import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth } from '../services/api';

/**
 * Custom React Hook to monitor NetGuard AI API health status in real time.
 * Provides accurate states without mocking or fake indicators.
 */
export function useApiHealth() {
  const [healthState, setHealthState] = useState({
    isConnected: false,
    statusText: 'Checking API...',
    data: null,
    loading: true,
    error: null,
  });

  const checkHealth = useCallback(async () => {
    setHealthState((prev) => ({ ...prev, loading: true }));
    const result = await checkBackendHealth();
    setHealthState({
      isConnected: result.connected,
      statusText: result.statusText,
      data: result.data,
      loading: false,
      error: result.error,
    });
  }, []);

  useEffect(() => {
    checkHealth();
    // Periodically re-check health status every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    ...healthState,
    refresh: checkHealth,
  };
}

export default useApiHealth;
