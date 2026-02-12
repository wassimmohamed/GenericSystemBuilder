import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Cache the browser timezone once at module load
const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token, language, and timezone headers
apiClient.interceptors.request.use(
  (config) => {
    // Attach JWT Bearer token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach client language
    const language = localStorage.getItem('language') || navigator.language || 'en';
    config.headers['Accept-Language'] = language;

    // Attach client timezone
    const timezone = localStorage.getItem('timezone') || detectedTimezone;
    config.headers['X-Timezone'] = timezone;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
