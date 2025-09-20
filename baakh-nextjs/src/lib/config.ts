// Backend API configuration
export const BACKEND_CONFIG = {
  // Backend server URL - change this to your backend server URL
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001',
  
  // API endpoints
  ENDPOINTS: {
    POETS: '/api/poets',
    COUPLETS: '/api/couplets',
    CATEGORIES: '/api/categories',
    PERIODS: '/api/periods',
    SEARCH: '/api/search',
    AUTH: '/api/auth',
    ADMIN: '/api/admin'
  },
  
  // Request configuration
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${BACKEND_CONFIG.BASE_URL}${endpoint}`;
}

// Helper function to make API requests
export async function apiRequest(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  const url = getApiUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      ...BACKEND_CONFIG.DEFAULT_HEADERS,
      ...options.headers
    },
    signal: (() => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), BACKEND_CONFIG.DEFAULT_TIMEOUT);
      return controller.signal;
    })()
  };
  
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, defaultOptions);
    console.log(`📡 API Response: ${response.status} ${response.statusText}`);
    return response;
  } catch (error) {
    console.error(`❌ API Request failed:`, error);
    throw error;
  }
}
