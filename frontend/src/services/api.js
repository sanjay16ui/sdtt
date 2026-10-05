import { env } from '@/config/env';

/**
 * Service handler for FastAPI backend endpoints (/api).
 * Includes graceful client fallback when backend server is initializing.
 */
class ApiService {
  constructor() {
    this.baseUrl = env.API_BASE_URL;
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(`[ApiService] Fallback for ${endpoint}:`, error.message);
      return null;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(`[ApiService] Fallback for POST ${endpoint}:`, error.message);
      return null;
    }
  }
}

export const api = new ApiService();
export default api;
