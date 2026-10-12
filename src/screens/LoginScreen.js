import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Screen, Button, Field, Card } from '../components/ui';
import { colors } from '../theme';

const Logo = require('../../assets/logo2.png');

const EMPTY = { name: '', email: '', password: '', confirmPassword: '', terms: false };

function friendlyAuthError(e) {
  switch (e?.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email ya password ghalat hai.';
    case 'auth/invalid-email':
      return 'Email sahi format mein likhein.';
    case 'auth/email-already-in-use':
      return 'Is email se account pehle se bana hua hai.';
    case 'auth/weak-password':
      return 'Password kam az kam 6 characters ka hona chahiye.';
    case 'auth/too-many-requests':
      return 'Bohat zyada koshishein. Thori der baad dobara try karein.';
    case 'auth/network-request-failed':
      return 'Internet connection check karein.';
    default:
      return 'Authentication failed. Please check your credentials.';
  }
}

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const toggle = () => {
    setError('');
    setForm(EMPTY);
    setIsLogin((p) => !p);
  };

  const submit = async () => {
    setError('');
    const { name, email, password, confirmPassword, terms } = form;
    const mail = email.trim();

    if (!mail || !password) {
      setError('Email aur password likhein.');
      return;
    }
    if (!isLogin) {
      if (!name.trim()) return setError('Apna poora naam likhein.');
      if (password.length < 6) return setError('Password kam az kam 6 characters ka ho.');
      if (password !== confirmPassword) return setError('Passwords match nahi karte.');
      if (!terms) return setError("Please accept the clinic's terms of use.");
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, mail, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, mail, password);
        await updateProfile(res.user, { displayName: name.trim() });
        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          displayName: name.trim(),
          email: mail,
        });
      }
      // Navigation App.js khud sambhal leta hai (login ke baad Home khul jata hai)
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    const mail = form.email.trim();
    if (!mail) {
      setError('Pehle upar email likhein, phir "Forgot Password" dabayein.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, mail);
      Alert.alert('Email bhej di gayi', 'Password reset ka link aap ke email par bhej diya gaya hai.');
    } catch (e) {
      setError(friendlyAuthError(e));
    }
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <Card style={styles.card}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />

        {isLogin ? (
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <Text style={styles.welcome}>Welcome back!</Text>
            <Text style={styles.sub}>Manage your herbal treatments with confidence.</Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <Text style={styles.welcome}>Create Account</Text>
            <Text style={styles.sub}>Set up your clinic access to manage patients and prescriptions.</Text>
          </View>
        )}

        {!isLogin && (
          <Field placeholder="Full Name" value={form.name} onChangeText={(v) => set('name', v)} />
        )}
        <Field
          placeholder="Email"
          value={form.email}
          onChangeText={(v) => set('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Field
          placeholder="Password"
          value={form.password}
          onChangeText={(v) => set('password', v)}
          secureTextEntry
          autoCapitalize="none"
        />
        {!isLogin && (
          <Field
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChangeText={(v) => set('confirmPassword', v)}
            secureTextEntry
            autoCapitalize="none"
          />
        )}

        {!isLogin && (
          <TouchableOpacity style={styles.termsRow} onPress={() => set('terms', !form.terms)}>
            <View style={[styles.checkbox, form.terms && styles.checkboxOn]}>
              {form.terms && <Text style={{ color: '#fff', fontSize: 13 }}>✓</Text>}
            </View>
            <Text style={styles.terms}>I accept the Terms of Use & Privacy Policy.</Text>
          </TouchableOpacity>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={isLogin ? 'Sign In' : 'Sign Up'} onPress={submit} loading={loading} />

        {isLogin ? (
          <>
            <TouchableOpacity onPress={forgotPassword} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>
            <View style={styles.switchRow}>
              <Text style={{ color: colors.muted }}>Don't have an account? </Text>
              <TouchableOpacity onPress={toggle}>
                <Text style={styles.link}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.switchRow}>
            <Text style={{ color: colors.muted }}>Already registered? </Text>
            <TouchableOpacity onPress={toggle}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 22, borderRadius: 18 },
  logo: { width: 110, height: 110, alignSelf: 'center', marginBottom: 8 },
  welcome: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxOn: { backgroundColor: colors.green },
  terms: { flex: 1, fontSize: 13, color: colors.text },
  error: { color: colors.danger, marginBottom: 12, textAlign: 'center' },
  link: { color: colors.greenDark, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
});
