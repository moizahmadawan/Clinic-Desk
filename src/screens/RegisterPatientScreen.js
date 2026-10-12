import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Screen, Button, Field, ChoiceRow } from '../components/ui';
import { useLang } from '../i18n';
import { findDuplicate, nextVisitInfo } from '../utils/patients';
import { colors } from '../theme';

const EMPTY = {
  patientName: '',
  fatherOrHusbandName: '',
  age: '',
  gender: '',
  maritalStatus: '',
  phone: '',
  email: '',
  bp: '',
  sugar: '',
  city: '',
  country: '',
  address: '',
  Symptoms: '',
};

// zaroori fields -> translation key
const REQUIRED = {
  patientName: 'f_patientName',
  fatherOrHusbandName: 'f_father',
  age: 'f_age',
  gender: 'f_gender',
  maritalStatus: 'f_marital',
  phone: 'f_phone',
  city: 'f_city',
  country: 'f_country',
  address: 'f_address',
};

// "YYYY-MM-DDTHH:mm" (local time) - purani app wala hi format
function nowLocal() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function RegisterPatientScreen({ navigation }) {
  const { t, isUr } = useLang();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const req = (key) => t(key) + ' *';
  const opt = (key) => t(key) + ' ' + t('optional');

  const submit = async () => {
    const missing = Object.keys(REQUIRED).filter((k) => !String(form[k]).trim());
    if (missing.length) {
      Alert.alert(t('reg_missingTitle'), t('reg_missingMsg') + '\n\n• ' + missing.map((k) => t(REQUIRED[k])).join('\n• '));
      return;
    }

    setSaving(true);
    try {
      // Pehle se register to nahi?
      const snap = await getDocs(collection(db, 'patients'));
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const dup = findDuplicate(all, form);
      if (dup) {
        const info = nextVisitInfo(dup);
        const msgKey = info.isNew ? 'dup_msgNew' : 'dup_msgSame';
        Alert.alert(
          t('dup_title'),
          t(msgKey, { name: dup.patientName, visit: info.current, next: info.next }),
          [
            { text: t('cancel'), style: 'cancel' },
            { text: t('dup_open'), onPress: () => navigation.replace('Recommend', { id: dup.id }) },
          ]
        );
        return;
      }

      const data = {};
      Object.keys(form).forEach((k) => (data[k] = String(form[k]).trim()));
      data.date = nowLocal();
      data.visitNumber = 1; // pehli dafa aaya hai
      data.recommendationCount = 0;
      data.lastVisitDate = '';
      await addDoc(collection(db, 'patients'), data);

      Alert.alert('✅', t('reg_success'));
      navigation.replace('Patients');
    } catch (e) {
      console.error('Error adding patient:', e);
      Alert.alert(t('error'), t('reg_fail'));
    } finally {
      setSaving(false);
    }
  };

  const genderOptions = [
    { value: 'Male', label: t('male') },
    { value: 'Female', label: t('female') },
    { value: 'Other', label: t('other') },
  ];
  const maritalOptions = [
    { value: 'Single', label: t('single') },
    { value: 'Married', label: t('married') },
    { value: 'Divorced', label: t('divorced') },
    { value: 'Widowed', label: t('widowed') },
  ];

  const align = isUr ? { textAlign: 'right', writingDirection: 'rtl' } : null;

  return (
    <Screen>
      <Text style={[styles.stamp, align]}>
        {t('f_date')}: {nowLocal().replace('T', '  ')}
      </Text>

      <Field rtl={isUr} label={req('f_patientName')} value={form.patientName} onChangeText={(v) => set('patientName', v)} />
      <Field rtl={isUr} label={req('f_father')} value={form.fatherOrHusbandName} onChangeText={(v) => set('fatherOrHusbandName', v)} />
      <Field rtl={isUr} label={req('f_age')} value={form.age} onChangeText={(v) => set('age', v)} keyboardType="numeric" />
      <ChoiceRow rtl={isUr} label={req('f_gender')} options={genderOptions} value={form.gender} onChange={(v) => set('gender', v)} />
      <ChoiceRow rtl={isUr} label={req('f_marital')} options={maritalOptions} value={form.maritalStatus} onChange={(v) => set('maritalStatus', v)} />

      <View style={styles.visitBox}>
        <Text style={[styles.visitLabel, align]}>{t('f_visit')}</Text>
        <Text style={[styles.visitValue, align]}>{t('reg_visit_first')}</Text>
        <Text style={[styles.visitHint, align]}>{t('reg_visit_auto')}</Text>
      </View>

      <Field rtl={isUr} label={req('f_phone')} value={form.phone} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
      <Field rtl={isUr} label={opt('f_email')} value={form.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
      <Field rtl={isUr} label={opt('f_bp')} value={form.bp} onChangeText={(v) => set('bp', v)} />
      <Field rtl={isUr} label={opt('f_sugar')} value={form.sugar} onChangeText={(v) => set('sugar', v)} />
      <Field rtl={isUr} label={req('f_city')} value={form.city} onChangeText={(v) => set('city', v)} />
      <Field rtl={isUr} label={req('f_country')} value={form.country} onChangeText={(v) => set('country', v)} />
      <Field rtl={isUr} label={req('f_address')} value={form.address} onChangeText={(v) => set('address', v)} multiline />
      <Field rtl={isUr} label={t('f_symptoms')} value={form.Symptoms} onChangeText={(v) => set('Symptoms', v)} multiline />

      <Button title={t('reg_btn')} onPress={submit} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stamp: {
    backgroundColor: colors.greenLight,
    color: colors.greenDark,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    fontWeight: '600',
  },
  visitBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  visitLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  visitValue: { fontSize: 18, fontWeight: '800', color: colors.greenDark, marginTop: 2 },
  visitHint: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
