/**
 * NetGuard AI - Centralized Frontend API Service Client
 * Handles communication with the FastAPI backend using VITE_API_BASE_URL.
 */

function normalizeApiBaseUrl(rawUrl) {
  const cleaned = (rawUrl || 'http://localhost:8000/api/v1').trim().replace(/\/+$/, '');
  return cleaned.endsWith('/api/v1') ? cleaned : `${cleaned}/api/v1`;
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

/**
 * Reusable HTTP fetch client with timeout and uniform error formatting.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // Allow headroom for cloud cold-starts & ML inference

  try {
    const isFormData = options.body instanceof FormData;
    const defaultHeaders = {
      Accept: 'application/json',
    };
    if (!isFormData) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errorDetail = errorJson?.detail || errorJson?.message;
      const errorBody = errorDetail || (await response.text().catch(() => ''));
      throw new Error(
        errorDetail || `HTTP ${response.status} (${response.statusText}): ${errorBody || 'Server error'}`
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
      isOffline:
        isAbort ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('Load failed'),
    };
  }
}

/**
 * Health check request to GET /api/v1/health.
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
 * Uploads a network traffic CSV file for real machine learning analysis.
 * POST /api/v1/analysis
 */
export async function uploadTrafficCsv(file) {
  const formData = new FormData();
  formData.append('file', file);

  return request('/analysis', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Retrieves prediction history from GET /api/v1/predictions.
 */
export async function fetchPredictions(skip = 0, limit = 100) {
  return request(`/predictions?skip=${skip}&limit=${limit}`, { method: 'GET' });
}

/**
 * Retrieves telemetry summary from GET /api/v1/analytics.
 */
export async function fetchAnalytics() {
  return request('/analytics', { method: 'GET' });
}

/**
 * Retrieves ML model metadata and evaluation metrics from GET /api/v1/model.
 */
export async function fetchModelInfo() {
  return request('/model', { method: 'GET' });
}

export default {
  API_BASE_URL,
  checkBackendHealth,
  uploadTrafficCsv,
  fetchPredictions,
  fetchAnalytics,
  fetchModelInfo,
};
