const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('smartlib_token');
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/pdf')) {
      const blob = await response.blob();
      return blob;
    }

    if (contentType && contentType.includes('text/csv')) {
      const blob = await response.blob();
      return blob;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred during API request.');
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const authAPI = {
  login: (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiRequest('/api/auth/me'),
  updateProfile: (profile) => apiRequest('/api/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  uploadAvatar: (formData) => apiRequest('/api/auth/upload-avatar', { method: 'POST', body: formData }),
  changePassword: (data) => apiRequest('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email) => apiRequest('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
};

export const bookAPI = {
  getBooks: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/api/books?${q}`);
  },
  getBookById: (id) => apiRequest(`/api/books/${id}`),
  createBook: (data) => apiRequest('/api/books', { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id, data) => apiRequest(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBook: (id) => apiRequest(`/api/books/${id}`, { method: 'DELETE' }),
  archiveBook: (id) => apiRequest(`/api/books/${id}/archive`, { method: 'POST' }),
  restoreBook: (id) => apiRequest(`/api/books/${id}/restore`, { method: 'POST' }),
  uploadCover: (formData) => apiRequest('/api/books/upload-cover', { method: 'POST', body: formData }),
  importCSV: (formData) => apiRequest('/api/books/import-csv', { method: 'POST', body: formData }),
  getCategories: () => apiRequest('/api/categories')
};

export const circAPI = {
  issueBook: (data) => apiRequest('/api/transactions/issue', { method: 'POST', body: JSON.stringify(data) }),
  returnBook: (data) => apiRequest('/api/transactions/return', { method: 'POST', body: JSON.stringify(data) }),
  renewBook: (data) => apiRequest('/api/transactions/renew', { method: 'POST', body: JSON.stringify(data) }),
  getTransactions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/api/transactions?${q}`);
  },
  getReservations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/api/reservations?${q}`);
  },
  createReservation: (data) => apiRequest('/api/reservations', { method: 'POST', body: JSON.stringify(data) }),
  cancelReservation: (id) => apiRequest(`/api/reservations/${id}`, { method: 'DELETE' }),
  getFines: () => apiRequest('/api/fines'),
  payFine: (txId) => apiRequest(`/api/fines/${txId}/pay`, { method: 'POST' }),
  waiveFine: (txId) => apiRequest(`/api/fines/${txId}/waive`, { method: 'POST' })
};

export const communityAPI = {
  getRequests: () => apiRequest('/api/book-requests'),
  createRequest: (data) => apiRequest('/api/book-requests', { method: 'POST', body: JSON.stringify(data) }),
  voteRequest: (id) => apiRequest(`/api/book-requests/${id}/vote`, { method: 'POST' }),
  updateRequestStatus: (id, data) => apiRequest(`/api/book-requests/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  getWishlist: () => apiRequest('/api/wishlist'),
  toggleWishlist: (bookId) => apiRequest('/api/wishlist', { method: 'POST', body: JSON.stringify({ bookId }) }),
  addReview: (data) => apiRequest('/api/reviews', { method: 'POST', body: JSON.stringify(data) })
};

export const studentAPI = {
  getAnalytics: () => apiRequest('/api/reading/analytics'),
  getGoals: () => apiRequest('/api/reading/goals'),
  createGoal: (data) => apiRequest('/api/reading/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id, data) => apiRequest(`/api/reading/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getFacilities: () => apiRequest('/api/facilities'),
  getBookings: () => apiRequest('/api/facilities/bookings'),
  bookFacility: (data) => apiRequest('/api/facilities/book', { method: 'POST', body: JSON.stringify(data) }),
  cancelBooking: (id) => apiRequest(`/api/facilities/bookings/${id}`, { method: 'DELETE' })
};

export const aiAPI = {
  getForYou: (limit = 8) => apiRequest(`/api/recommendations/for-you?limit=${limit}`),
  getBecauseYouBorrowed: () => apiRequest('/api/recommendations/because-you-borrowed'),
  getTrending: () => apiRequest('/api/recommendations/trending'),
  getDepartment: (dept) => apiRequest(`/api/recommendations/department?department=${encodeURIComponent(dept)}`),
  getInventoryHealth: () => apiRequest('/api/predictions/inventory-health'),
  chatAssistant: (query, payload = {}) => apiRequest('/api/assistant/chat', { method: 'POST', body: JSON.stringify({ query, ...payload }) }),
  scanOCR: (formData) => apiRequest('/api/ocr/scan', { method: 'POST', body: formData })
};

export const adminAPI = {
  getUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/api/users?${q}`);
  },
  getUserDetail: (id) => apiRequest(`/api/users/${id}`),
  updateUser: (id, data) => apiRequest(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => apiRequest(`/api/users/${id}`, { method: 'DELETE' }),
  getLibrarians: () => apiRequest('/api/librarians'),
  addLibrarian: (data) => apiRequest('/api/librarians', { method: 'POST', body: JSON.stringify(data) }),
  getSuppliers: () => apiRequest('/api/suppliers'),
  createSupplier: (data) => apiRequest('/api/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  getAcquisitions: () => apiRequest('/api/acquisitions'),
  createAcquisition: (data) => apiRequest('/api/acquisitions', { method: 'POST', body: JSON.stringify(data) }),
  getDashboard: () => apiRequest('/api/analytics/dashboard'),
  getAuditLogs: () => apiRequest('/api/audit-logs'),
  getSettings: () => apiRequest('/api/settings'),
  updateSettings: (data) => apiRequest('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getNotifications: () => apiRequest('/api/notifications'),
  markNotifRead: (id) => apiRequest(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotifsRead: () => apiRequest('/api/notifications/read-all', { method: 'PUT' }),
  getHealth: () => apiRequest('/api/health')
};
