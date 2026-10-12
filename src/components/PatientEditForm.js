import React, { useState } from 'react';
import { Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Button, Field, ChoiceRow } from './ui';
import { useLang } from '../i18n';
import { visitOf } from '../utils/patients';

const FIELDS = [
  'patientName',
  'fatherOrHusbandName',
  'age',
  'gender',
  'maritalStatus',
  'phone',
  'email',
  'bp',
  'sugar',
  'city',
  'country',
  'address',
  'Symptoms',
];

function toForm(p) {
  const f = {};
  FIELDS.forEach((k) => (f[k] = p[k] !== undefined && p[k] !== null ? String(p[k]) : ''));
  f.visitNumber = String(visitOf(p));
  return f;
}

/**
 * Patient ka data badalne ka form (Edit screen aur Recommendation screen dono mein use hota hai).
 * Save hone par onSaved(naya data) chalta hai.
 */
export default function PatientEditForm({ patient, onSaved }) {
  const { t, isUr } = useLang();
  const [form, setForm] = useState(() => toForm(patient));
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.patientName.trim()) {
      Alert.alert(t('error'), t('e_nameReq'));
      return;
    }
    setSaving(true);
    try {
      const data = {};
      FIELDS.forEach((k) => (data[k] = form[k].trim()));
      data.visitNumber = Math.max(1, parseInt(form.visitNumber, 10) || 1);
      await updateDoc(doc(db, 'patients', patient.id), data);
      onSaved && onSaved(data);
    } catch (e) {
      console.error(e);
      Alert.alert(t('error'), t('e_saveErr'));
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

  return (
    <>
      <Field rtl={isUr} label={t('f_patientName')} value={form.patientName} onChangeText={(v) => set('patientName', v)} />
      <Field rtl={isUr} label={t('f_father')} value={form.fatherOrHusbandName} onChangeText={(v) => set('fatherOrHusbandName', v)} />
      <Field rtl={isUr} label={t('f_age')} value={form.age} onChangeText={(v) => set('age', v)} keyboardType="numeric" />
      <ChoiceRow rtl={isUr} label={t('f_gender')} options={genderOptions} value={form.gender} onChange={(v) => set('gender', v)} />
      <ChoiceRow rtl={isUr} label={t('f_marital')} options={maritalOptions} value={form.maritalStatus} onChange={(v) => set('maritalStatus', v)} />
      <Field rtl={isUr} label={t('f_visit')} value={form.visitNumber} onChangeText={(v) => set('visitNumber', v.replace(/\D/g, ''))} keyboardType="numeric" />
      <Field rtl={isUr} label={t('f_phone')} value={form.phone} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
      <Field rtl={isUr} label={t('f_email')} value={form.email} onChangeText={(v) => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
      <Field rtl={isUr} label={t('f_bp')} value={form.bp} onChangeText={(v) => set('bp', v)} />
      <Field rtl={isUr} label={t('f_sugar')} value={form.sugar} onChangeText={(v) => set('sugar', v)} />
      <Field rtl={isUr} label={t('f_city')} value={form.city} onChangeText={(v) => set('city', v)} />
      <Field rtl={isUr} label={t('f_country')} value={form.country} onChangeText={(v) => set('country', v)} />
      <Field rtl={isUr} label={t('f_address')} value={form.address} onChangeText={(v) => set('address', v)} multiline />
      <Field rtl={isUr} label={t('f_symptoms')} value={form.Symptoms} onChangeText={(v) => set('Symptoms', v)} multiline />
      <Button title={t('e_save')} onPress={save} loading={saving} />
    </>
  );
}
