import { useEffect, useState } from 'react';
import { requestPermission, getAndSaveToken, listenForMessages } from '../services/notificationService';

const useNotification = () => {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    // Always attach listener regardless of permission state
    listenForMessages(() => {});

    if (Notification.permission === 'granted') {
      getAndSaveToken().then(setToken);
    } else if (Notification.permission === 'default') {
      requestPermission().then(setToken);
    }
  }, []);

  const askPermission = async () => {
    const fcmToken = await requestPermission();
    setToken(fcmToken);
    setPermission(Notification.permission);
  };

  return { token, permission, askPermission };
};

export default useNotification;
