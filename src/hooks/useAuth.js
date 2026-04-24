import { useState, useEffect } from 'react';
import { apiHelper } from '../utils/apiHelper';

// Global state to ensure single API call
let globalAuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  initialized: false
};

let listeners = [];
let apiCallPromise = null;

const notifyListeners = () => {
  listeners.forEach(listener => listener(globalAuthState));
};

const fetchUserOnce = async () => {
  if (apiCallPromise) {
    return apiCallPromise;
  }

  apiCallPromise = (async () => {
    try {
      const response = await apiHelper.get('/auth/fetchUserByToken');
      const userData = response?.user || response?.data || response;
      globalAuthState = {
        user: userData,
        isAuthenticated: true,
        loading: false,
        initialized: true
      };
    } catch (error) {
      if (error?.message && error?.message?.includes('logged in from another device')) {
        return;
      }
      globalAuthState = {
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: true
      };
    }
    notifyListeners();
  })();

  return apiCallPromise;
};

export const useAuth = () => {
  const [state, setState] = useState(globalAuthState);

  useEffect(() => {
    const listener = (newState) => {
      setState({ ...newState });
    };

    listeners.push(listener);

    if (!globalAuthState.initialized) {
      fetchUserOnce();
    }

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const login = (userData) => {
    if (!userData) {
      window.location.href = '/login';
      return;
    }
    globalAuthState = {
      user: userData,
      isAuthenticated: true,
      loading: false,
      initialized: true
    };
    if (userData?.role) {
      localStorage.setItem('userRole', userData.role);
    }
    notifyListeners();

    // Request FCM token on login
    if ('Notification' in window && Notification.permission === 'granted') {
      import('../services/notificationService').then(({ getAndSaveToken }) => getAndSaveToken());
    } else if ('Notification' in window && Notification.permission === 'default') {
      import('../services/notificationService').then(({ requestPermission }) => requestPermission());
    }
  };

  const logout = async () => {
    // Fire and forget - don't block logout
    const token = localStorage.getItem('fcmToken');
    if (token) {
      apiHelper.post('/firebaseNotification/token/remove', { token }).catch(() => { });
      localStorage.removeItem('fcmToken');
    }
    try {
      await apiHelper.get('/auth/logout');
    } catch (error) {
      console.log('Logout API error:', error);
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    localStorage.removeItem('userRole');
    globalAuthState = {
      user: null,
      isAuthenticated: false,
      loading: false,
      initialized: true
    };
    notifyListeners();
  };

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    logout
  };
};