// Loading state management
let activeRequests = new Set();
const loadingCallbacks = new Set();

const notifyLoadingChange = () => {
  const isLoading = activeRequests.size > 0;
  loadingCallbacks.forEach(callback => callback(isLoading, Array.from(activeRequests)));
};

export const subscribeToLoading = (callback) => {
  loadingCallbacks.add(callback);
  return () => loadingCallbacks.delete(callback);
};

const API_BASE_URL = import.meta.env.VITE_API_URL;
const CSRF_TOKEN =
  "66fe53509b4b7dd213a240af7619663619dcb9abdf73467e74d1f8181dec0602.7632f5c48bcc9670724158f48888ee105c9c151ca486e72bbd550cd26ea79f89a79f8988e65bba1a2fcbf295024cd693280816bdab05490b233e76f0cdfa3cdd3d6747";

// Cache IP address
let cachedIP = null;

// Get user's IP address with caching
const getUserIP = async () => {
  if (cachedIP) {
    return cachedIP;
  }

  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    cachedIP = data.ip;
    return cachedIP;
  } catch (error) {
    cachedIP = "127.0.0.1";
    return cachedIP;
  }
};

const handleResponse = async (response, requestId) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  // Remove from active requests when response is received
  if (requestId) {
    activeRequests.delete(requestId);
    notifyLoadingChange();
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    if (isJson) {
      const result = await response.json();
      if (result.error && result.error.includes("logged in from another device")) {
        const publicRoutes = ["/login", "/register", "/suprime/super-admin", "/"];
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (!publicRoutes.includes(window.location.pathname)) window.location.href = "/login";
        return;
      }
      message = result.message || result.error || message;
    } else {
      const text = await response.text();
      const match = text.match(/<pre>Error:\s*(.*?)(<br>|<\/pre>)/i);
      if (match) message = match[1].trim();
    }
    throw new Error(message);
  }

  return isJson ? await response.json() : await response.text();
};

export const apiHelper = {
  async post(endpoint, data, options = {}) {
    const requestId = options.trackLoading ? `${endpoint}-${Date.now()}` : null;
    
    try {
      // Add to active requests if tracking is enabled
      if (requestId) {
        activeRequests.add(requestId);
        notifyLoadingChange();
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": await getUserIP(),
          "x-csrf-token": CSRF_TOKEN,
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      return await handleResponse(response, requestId);
    } catch (error) {
      // Remove from active requests on error
      if (requestId) {
        activeRequests.delete(requestId);
        notifyLoadingChange();
      }
      throw error;
    }
  },

  async get(endpoint, options = {}) {
    const requestId = options.trackLoading ? `${endpoint}-${Date.now()}` : null;
    
    try {
      // Add to active requests if tracking is enabled
      if (requestId) {
        activeRequests.add(requestId);
        notifyLoadingChange();
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": await getUserIP(),
          "x-csrf-token": CSRF_TOKEN,
        },
        credentials: "include",
      });

      return await handleResponse(response, requestId);
    } catch (error) {
      // Remove from active requests on error
      if (requestId) {
        activeRequests.delete(requestId);
        notifyLoadingChange();
      }
      throw error;
    }
  },

  async delete(endpoint, data = null) {
    try {
      const options = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": await getUserIP(),
          "x-csrf-token": CSRF_TOKEN,
        },
        credentials: "include",
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

  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": await getUserIP(),
          "x-csrf-token": CSRF_TOKEN,
        },
        credentials: "include",
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": await getUserIP(),
          "x-csrf-token": CSRF_TOKEN,
        },
        credentials: "include",
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
        method: "POST",
        headers: {
          "X-Forwarded-For": await getUserIP(),
          "x-csrf-token": CSRF_TOKEN,
        },
        credentials: "include",
        body: formData,
      });

      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  async putFormData(endpoint, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "X-Forwarded-For": await getUserIP(),
          "x-csrf-token": CSRF_TOKEN,
        },
        credentials: "include",
        body: formData,
      });

      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
};
