// Safe localStorage utility for mobile compatibility
export const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      if (typeof Storage !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    return false;
  },

  getItem: (key) => {
    try {
      if (typeof Storage !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    return null;
  },

  removeItem: (key) => {
    try {
      if (typeof Storage !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    return false;
  }
};