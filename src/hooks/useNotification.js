import { useEffect, useState } from 'react';
import { requestPermission, getAndSaveToken, listenForMessages } from '../services/notificationService';

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

const useNotification = () => {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if (isIOS()) return; // iOS mein kuch mat karo

    listenForMessages(() => {});

    if (Notification.permission === 'granted') {
      getAndSaveToken().then(setToken);
    } else if (Notification.permission === 'default') {
      requestPermission().then(setToken);
    }
  }, []);

  const askPermission = async () => {
    if (isIOS()) return;
    const fcmToken = await requestPermission();
    setToken(fcmToken);
    setPermission(Notification.permission);
  };

  return { token, permission, askPermission };
};

export default useNotification;
