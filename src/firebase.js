import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC1ePHriV2dzOXdAwsu545pvjMGlP6V8Mo',
  authDomain: 'herbal-app-70b80.firebaseapp.com',
  projectId: 'herbal-app-70b80',
  storageBucket: 'herbal-app-70b80.firebasestorage.app',
  messagingSenderId: '445531404538',
  appId: '1:445531404538:web:cbbc640ef604642aa8f143',
  measurementId: 'G-QT3RFPXMDL',
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
