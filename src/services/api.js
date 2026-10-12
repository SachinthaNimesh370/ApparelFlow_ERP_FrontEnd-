// Centralized API client for ApparelFlow ERP
const API_BASE = '/api';

export const getStoredToken = () => localStorage.getItem('af_token');
export const setStoredToken = (token) => localStorage.setItem('af_token', token);
export const getStoredUser = () => {
  const user = localStorage.getItem('af_user');
  return user ? JSON.parse(user) : null;
};
export const setStoredUser = (user) => localStorage.setItem('af_user', JSON.stringify(user));
export const clearAuthStorage = () => {
  localStorage.removeItem('af_token');
  localStorage.removeItem('af_user');
};

async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || (data?.details ? JSON.stringify(data.details) : `Request failed (${response.status})`);
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getDemoUsers: () => apiRequest('/auth/demo-users'),
  getMe: () => apiRequest('/auth/me'),

  // Recipes
  getRecipes: () => apiRequest('/recipes'),
  getRecipe: (id) => apiRequest(`/recipes/${id}`),

  // Orders
  getOrders: (status) => apiRequest(status ? `/orders?status=${status}` : '/orders'),
  getOrder: (id) => apiRequest(`/orders/${id}`),
  createOrder: (payload) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateCounts: (orderId, counts) => apiRequest(`/orders/${orderId}/counts`, {
    method: 'PUT',
    body: JSON.stringify({ counts })
  }),
  approveOrder: (orderId) => apiRequest(`/orders/${orderId}/approve`, {
    method: 'POST'
  }),
  rejectOrder: (orderId, rejectionNote) => apiRequest(`/orders/${orderId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rejection_note: rejectionNote })
  }),

  // Sewing Queue
  getSewingQueue: () => apiRequest('/sewing/queue'),
  startSewing: (orderId) => apiRequest(`/sewing/${orderId}/start`, {
    method: 'POST'
  })
};
