import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://leapon.onrender.com/api'; 

// Ensure WebSocket URL is correct
export const WS_URL = import.meta.env.VITE_API_URL.replace(/^http/, 'ws');

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    } else {
      console.warn('No token found in localStorage');
    }

    // Debug: Log the request headers to verify the token is being added
    console.log('Request headers:', config.headers);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.warn('Token expired or invalid. Redirecting to login.');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');

      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }

    return Promise.reject(error);
  }
);

// API methods for user accounts
export const userApi = {
  login: (email, password) => api.post('/users/login', { email, password }),
  register: (data) => api.post('/users/register', data),
  getMentors: () => api.get('/users/mentors'),
  getMentees: () => api.get('/users/mentees'),
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  getCurrentUser: () => api.get('/users/profile'), 
  updateProfile: (data) => api.put('/users/profile', data),
  updatePassword: async (data) => {
    return await api.put('/users/password', data);
  },
  completeProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_URL}/users/complete-profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to complete profile'
      };
    }
  },
  uploadProfilePicture: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/users/profile-picture', formData, config);
  },
  logout: () => api.post('/auth/logout'),
  sendVerificationEmail: (email) => api.post('/users/resend-verification', { email }),
  verifyEmail: (token) => api.get(`/users/verify-email/${token}`),
  checkVerificationStatus: () => api.get('/users/me'),
  initializePayment: (paymentData) => api.post('/payments/initialize', paymentData),
  verifyPayment: (reference) => api.post('/payments/verify', { reference }),
  getPaymentHistory: () => api.get('/payments/history'),
  updateRole: (data) => api.put('/users/update-role', data), 
  updateProfileStep2: (data) => api.put('/users/update-step-2', data),
  updateProfileStep3: (data) => api.put('/users/update-step-3', data),
  updateProfileStep4: (data) => api.put('/users/update-step-4', data),
  applyCoupon: (couponCode) => api.post('/payments/apply-coupon', { couponCode }),
  getAllUsers: async (params = {}) => {
    // Debug: Log the query parameters
    console.log('Query Parameters:', params);

    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/users${query ? `?${query}` : ''}`);

    // Debug: Log the API response
    console.log('API Response:', response.data);

    return response;
  },
  forgotPassword: (email) => api.post('/users/forgot-password', { email }),
  verifyOtp: (data) => api.post('/users/verify-otp', data), 
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response;
  },
};

// API methods for sessions
export const sessionApi = {
  getAll: () => api.get('/sessions'),
  getPending: () => api.get('/sessions/pending'),
  getAccepted: () => api.get('/sessions/accepted'),
  getHistory: () => api.get('/sessions/history'),
  getById: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  updateStatus: (id, status) => api.put(`/sessions/${id}/status`, { status }),
  addFeedback: (id, feedback) => api.post(`/sessions/${id}/feedback`, feedback),
  update: (id, data) => api.put(`/sessions/${id}/status`, data),
  delete: (id) => api.delete(`/sessions/${id}`),
  join: (id) => api.post(`/sessions/${id}/join`),
  leave: (id) => api.post(`/sessions/${id}/leave`),
  getUpcoming: () => api.get('/sessions/upcoming')
};

// API methods for messages
export const messageApi = {
  getAll: () => api.get('/messages'),
  getByUserId: (userId) => api.get(`/messages/${userId}`),
  send: (data) => api.post('/messages', data),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  getUnreadCount: () => api.get('/messages/unread/count')
};

// API methods for conversations
export const conversationApi = {
  getAll: () => api.get('/conversations'),
  getById: (id) => api.get(`/conversations/${id}`),
  create: (data) => api.post('/conversations', data),
  getMessages: (id) => api.get(`/conversations/${id}/messages`),
  sendMessage: (id, data) => api.post(`/conversations/${id}/messages`, data),
  markAsRead: (id) => api.put(`/conversations/${id}/read`)
};

// API methods for resources
export const resourceApi = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  download: (id) => api.get(`/resources/${id}/download`)
};

// API methods for progress
export const progressApi = {
  getProgress: () => api.get('/progress'),
  updateProgress: (data) => api.put('/progress', data),
  getAchievements: () => api.get('/progress/achievements'),
  getGoals: () => api.get('/progress/goals')
};

export default api;
