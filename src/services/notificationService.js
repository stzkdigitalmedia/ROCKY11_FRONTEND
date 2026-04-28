import { messaging, getToken, onMessage, isSupported } from '../config/firebase';
import { apiHelper } from '../utils/apiHelper';

const VAPID_KEY = "BElu9Xy8T1a4-HeXSvb-pPLLOYKjVP_1NjVfFwWHtx7ewiBIERGw24wUaghtldEQGHFRlbg9YVj1t8H9JmUOLok";

// iOS Safari check
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export const requestPermission = async () => {
  try {
    if (isIOS()) return null; // iOS mein silently skip
    const supported = await isSupported();
    if (!supported) return null;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await getAndSaveToken();
    }
    return null;
  } catch (error) {
    console.error('Permission error:', error);
    return null;
  }
};

export const getAndSaveToken = async () => {
  try {
    if (isIOS()) return null;
    const supported = await isSupported();
    if (!supported || !messaging) return null;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      const ua = navigator.userAgent;
      const deviceType = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'web';
      await apiHelper.post('/firebaseNotification/token/save', { token, deviceType });
      localStorage.setItem('fcmToken', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Token error:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    const token = localStorage.getItem('fcmToken');
    if (token) {
      await apiHelper.post('/firebaseNotification/token/remove', { token });
      localStorage.removeItem('fcmToken');
    }
  } catch (error) {
    console.error('Remove token error:', error);
  }
};

export const listenForMessages = (callback) => {
  if (isIOS() || !messaging) return; // iOS mein skip
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title || payload.data?.title || '';
    const body = payload.notification?.body || payload.data?.body || '';
    const icon = payload.data?.logoUrl || payload.notification?.icon || '/logo192.png';

    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon });
    }

    if (callback) callback(payload);
  });
};
