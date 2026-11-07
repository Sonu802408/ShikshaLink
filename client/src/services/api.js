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

export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath || typeof avatarPath !== 'string') return null;
  if (
    avatarPath.startsWith('http://') ||
    avatarPath.startsWith('https://') ||
    avatarPath.startsWith('blob:') ||
    avatarPath.startsWith('data:')
  ) {
    return avatarPath;
  }
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
  if (API_BASE && API_BASE.startsWith('http')) {
    const backendHost = API_BASE.replace(/\/api\/?$/, '');
    return `${backendHost}${cleanPath}`;
  }
  return cleanPath;
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
