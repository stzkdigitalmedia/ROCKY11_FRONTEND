import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
