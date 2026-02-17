import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface CreateUrlData {
  url: string;
  customAlias?: string;
  expiresAt?: string;
  password?: string;
}

export interface ShortUrl {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string;
  qrCodeUrl: string;
}

export interface UrlWithStats extends ShortUrl {
  isActive: boolean;
  clickCount: number;
}

export interface Analytics {
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDate: Array<{ date: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  topDevices: Array<{ device: string; count: number }>;
  topBrowsers: Array<{ browser: string; count: number }>;
  topReferers: Array<{ referer: string; count: number }>;
}

export const urlApi = {
  // Create short URL
  createUrl: (data: CreateUrlData) => api.post<ShortUrl>('/api/shorten', data),

  // Get user's URLs
  getUserUrls: (page = 1, limit = 20) =>
    api.get<{
      urls: UrlWithStats[];
      total: number;
      page: number;
      totalPages: number;
    }>('/api/urls', { params: { page, limit } }),

  // Get URL details
  getUrlDetails: (id: string) => api.get<UrlWithStats>(`/api/urls/${id}`),

  // Update URL
  updateUrl: (id: string, data: { originalUrl?: string; isActive?: boolean }) =>
    api.patch(`/api/urls/${id}`, data),

  // Delete URL
  deleteUrl: (id: string) => api.delete(`/api/urls/${id}`),

  // Get analytics
  getAnalytics: (id: string, days = 30) =>
    api.get<Analytics>(`/api/urls/${id}/analytics`, { params: { days } }),

  // Get QR code URL
  getQRCodeUrl: (shortCode: string, format: 'png' | 'svg' = 'png', size = 300) =>
    `${api.defaults.baseURL}/api/qr/${shortCode}?format=${format}&size=${size}`,

  // Export analytics
  exportAnalytics: (id: string) => api.get(`/api/urls/${id}/export`, { responseType: 'blob' }),
};

export default api;
