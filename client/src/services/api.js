const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = {
      success: false,
      message: response.status === 404
        ? 'Backend endpoint not found (404). Backend server connect nahi hai.'
        : `Server communication error (${response.status || 'Network Error'})`
    };
  }

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred during the request');
  }

  return data;
};
