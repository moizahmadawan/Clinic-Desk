// Dawaiyon / hidayat ki list: phone mein save (AsyncStorage) + Firestore mein backup.
// Naye phone par pehli dafa backup se wapas aa jati hai.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

const localKey = (key) => 'list:' + key;

export async function loadList(key, defaults, legacyKey) {
  // 1) phone mein save ki hui list
  try {
    const raw = await AsyncStorage.getItem(localKey(key));
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {}

  // 2) Firestore backup (naye phone / reinstall par)
  try {
    const snap = await withTimeout(getDoc(doc(db, 'appSettings', key)), 4000);
    if (snap.exists() && Array.isArray(snap.data().items)) {
      const items = snap.data().items;
      AsyncStorage.setItem(localKey(key), JSON.stringify(items)).catch(() => {});
      return items;
    }
  } catch (e) {}

  // 3) pehli dafa: default list (+ purani custom dawaiyan)
  const list = [...defaults];
  if (legacyKey) {
    try {
      const raw = await AsyncStorage.getItem(legacyKey);
      const extra = raw ? JSON.parse(raw) : [];
      extra.forEach((x) => {
        if (x && !list.includes(x)) list.push(x);
      });
    } catch (e) {}
  }
  return list;
}

export async function saveList(key, items) {
  try {
    await AsyncStorage.setItem(localKey(key), JSON.stringify(items));
  } catch (e) {
    console.warn('local save failed', e?.message);
  }
  try {
    await setDoc(doc(db, 'appSettings', key), { items, updatedAt: new Date().toISOString() });
  } catch (e) {
    // Firestore rules ya internet ka masla ho to bhi list phone mein save rehti hai
    console.warn('backup skipped:', e?.message);
  }
}
