/**
 * NetGuard AI - Centralized Frontend API Service Client
 * Handles communication with the FastAPI backend using VITE_API_BASE_URL.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api/v1';

/**
 * Reusable HTTP fetch client with timeout and uniform error formatting.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `HTTP ${response.status} (${response.statusText}): ${errorBody || 'Server error'}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      data,
      error: null,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isAbort = err.name === 'AbortError';
    return {
      success: false,
      data: null,
      error: isAbort ? 'Connection timed out' : err.message || 'Network unreachable',
      isOffline: isAbort || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError'),
    };
  }
}

/**
 * Real health check request to GET /api/v1/health.
 * Expected response: { status: "healthy", service: "NetGuard AI API" }
 */
export async function checkBackendHealth() {
  const result = await request('/health', { method: 'GET' });
  if (result.success && result.data?.status === 'healthy') {
    return {
      connected: true,
      statusText: 'API Connected',
      data: result.data,
      error: null,
    };
  }
  return {
    connected: false,
    statusText: 'API Offline',
    data: null,
    error: result.error || 'Backend service is not responding',
  };
}

/**
 * Retrieves prediction history from GET /api/v1/predictions.
 */
export async function fetchPredictions() {
  return request('/predictions', { method: 'GET' });
}

/**
 * Retrieves telemetry summary from GET /api/v1/analytics.
 */
export async function fetchAnalytics() {
  return request('/analytics', { method: 'GET' });
}

/**
 * Retrieves ML model metadata from GET /api/v1/model.
 */
export async function fetchModelInfo() {
  return request('/model', { method: 'GET' });
}

export default {
  API_BASE_URL,
  checkBackendHealth,
  fetchPredictions,
  fetchAnalytics,
  fetchModelInfo,
};
