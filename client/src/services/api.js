const API_BASE = '/api';

export const getStoredToken = () => {
  return localStorage.getItem('shikshalink_token');
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('shikshalink_token', token);
  } else {
    localStorage.removeItem('shikshalink_token');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getStoredToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Server communication error' }));

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred during the request');
  }

  return data;
};
