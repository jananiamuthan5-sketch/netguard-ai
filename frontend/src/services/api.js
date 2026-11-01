/**
 * NetGuard AI - Frontend API Service Client
 * Handles communication with the FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Checks the operational health of the NetGuard AI FastAPI backend.
 * Expected response: { status: "healthy", service: "NetGuard AI API" }
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      connected: true,
      data,
      error: null,
    };
  } catch (err) {
    return {
      connected: false,
      data: null,
      error: err.message || 'Unable to connect to NetGuard AI Backend',
    };
  }
}

/**
 * Placeholder API service functions for Phase 2:
 */
export async function fetchPredictions() {
  const response = await fetch(`${API_BASE_URL}/predictions`);
  return response.json();
}

export async function fetchAnalytics() {
  const response = await fetch(`${API_BASE_URL}/analytics`);
  return response.json();
}

export async function fetchModelInfo() {
  const response = await fetch(`${API_BASE_URL}/model`);
  return response.json();
}

export default {
  checkBackendHealth,
  fetchPredictions,
  fetchAnalytics,
  fetchModelInfo,
};
