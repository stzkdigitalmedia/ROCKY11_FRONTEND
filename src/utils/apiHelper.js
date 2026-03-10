const API_BASE_URL = import.meta.env.VITE_API_URL;

// Cache IP address
let cachedIP = null;

// Get user's IP address with caching
const getUserIP = async () => {
  if (cachedIP) {
    return cachedIP;
  }

  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    cachedIP = data.ip;
    return cachedIP;
  } catch (error) {
    cachedIP = '127.0.0.1';
    return cachedIP;
  }
};

const handleResponse = async (response) => {
  const result = await response.json();

  if (!response.ok) {
    // Handle single device login scenario
    if (result.error && result.error.includes('logged in from another device')) {
      // Check if current page is a public route
      const publicRoutes = ['/login', '/register', '/suprime/super-admin', '/'];
      const currentPath = window.location.pathname;

      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Only redirect if not already on a public route
      if (!publicRoutes.includes(currentPath)) {
        window.location.href = '/login';
      }
      return;
    }
    throw new Error(result.error || result.message || 'API request failed');
  }

  return result;
};

export const apiHelper = {
  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': await getUserIP(),
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': await getUserIP(),
        },
        credentials: 'include',
      });

      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': await getUserIP(),
        },
        credentials: 'include',
      });

      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': await getUserIP(),
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  async patch(endpoint, data = null) {
    try {
      const options = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': await getUserIP(),
        },
        credentials: 'include',
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
  async postFormData(endpoint, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'X-Forwarded-For': await getUserIP(),
        },
        credentials: 'include',
        body: formData,
      });

      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
};