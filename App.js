import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './src/firebase';
import { colors } from './src/theme';
import { Navigator } from './src/navigation';
import { LangProvider } from './src/i18n';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RegisterPatientScreen from './src/screens/RegisterPatientScreen';
import PatientListScreen from './src/screens/PatientListScreen';
import PatientDetailsScreen from './src/screens/PatientDetailsScreen';
import EditPatientScreen from './src/screens/EditPatientScreen';
import RecommendScreen from './src/screens/RecommendScreen';
import ClinicScreen from './src/screens/ClinicScreen';
import BuyScreen from './src/screens/BuyScreen';

const LOGGED_OUT = {
  Login: { component: LoginScreen, headerShown: false },
};

const LOGGED_IN = {
  Home: { component: HomeScreen, headerShown: false },
  Register: {
    component: RegisterPatientScreen,
    title: { en: 'Patient Registration', ur: 'مریض کی رجسٹریشن' },
    langToggle: true,
  },
  Patients: {
    component: PatientListScreen,
    title: { en: 'Registered Patients', ur: 'رجسٹرڈ مریض' },
    langToggle: true,
    initialParams: { mode: 'manage' },
  },
  Prescriptions: {
    component: PatientListScreen,
    title: { en: 'Prescriptions', ur: 'نسخے' },
    langToggle: true,
    initialParams: { mode: 'prescription' },
  },
  Medicine: {
    component: PatientListScreen,
    title: { en: 'Medicine', ur: 'دوائیں' },
    langToggle: true,
    initialParams: { mode: 'medicine' },
  },
  PatientDetails: { component: PatientDetailsScreen, title: { en: 'Patient Details', ur: 'مریض کی تفصیل' }, langToggle: true },
  EditPatient: { component: EditPatientScreen, title: { en: 'Edit Patient', ur: 'مریض میں ترمیم' }, langToggle: true },
  Recommend: { component: RecommendScreen, title: { en: 'Recommend Medicines', ur: 'دوائیں تجویز کریں' }, langToggle: true },
  Clinic: { component: ClinicScreen, title: { en: 'Clinic Notes', ur: 'کلینک نوٹس' }, langToggle: true },
  Buy: { component: BuyScreen, title: 'Herbal Products' },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Agar Firebase 6 second tak jawab na de to login screen dikha do (atakne se bachao)
    const timer = setTimeout(() => setReady(true), 6000);
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setReady(true);
      },
      (err) => {
        console.warn('Auth error:', err);
        setReady(true);
      }
    );
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* key badalne se login/logout par navigation reset ho jata hai */}
      <LangProvider>
        <Navigator
          key={user ? 'in' : 'out'}
          screens={user ? LOGGED_IN : LOGGED_OUT}
          initialRoute={user ? 'Home' : 'Login'}
        />
      </LangProvider>
    </SafeAreaProvider>
  );
}
