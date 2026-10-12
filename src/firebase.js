import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: ' ',
  authDomain: ' ',
  projectId: ' ',
  storageBucket: ' ',
  messagingSenderId: ' ',
  appId: ' ',
  measurementId: '',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Login phone band hone ke baad bhi yaad rahe (AsyncStorage persistence)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Fast Refresh par dobara initialize ho to existing instance le lo
  console.warn('initializeAuth skipped:', e?.message);
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
