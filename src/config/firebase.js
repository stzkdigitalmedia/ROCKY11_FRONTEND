import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyArDfW1ksEOCIZOEmLPLctl6_fWG28hsZA",
  authDomain: "rocky-io.firebaseapp.com",
  projectId: "rocky-io",
  storageBucket: "rocky-io.firebasestorage.app",
  messagingSenderId: "888195894847",
  appId: "1:888195894847:web:a2817226bcaddc958b328a",
  measurementId: "G-B55XFZ4WJ3"
};

const app = initializeApp(firebaseConfig);

// messaging only initialize karo agar supported ho (iOS Safari mein nahi hoga)
let messaging = null;
const initMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
    }
  } catch (e) {
    console.warn('Firebase messaging not supported:', e);
  }
};
initMessaging();

export { messaging, getToken, onMessage, isSupported };
