import React, { useEffect, useState } from 'react';
import { Text, Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Screen, Card, InfoRow, Loading, Button, formatDate } from '../components/ui';
import { useLang } from '../i18n';
import { visitOf } from '../utils/patients';

export default function PatientDetailsScreen({ navigation, route }) {
  const { id } = route.params;
  const { t, isUr } = useLang();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'patients', id));
        if (snap.exists()) setPatient({ id: snap.id, ...snap.data() });
        else {
          Alert.alert(t('error'), t('d_notFound'));
          navigation.goBack();
        }
      } catch (e) {
        console.error('Error fetching patient:', e);
        Alert.alert(t('error'), t('d_loadErr'));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!patient) return <Loading />;

  const meds = Array.isArray(patient.recommendedMedicines) ? patient.recommendedMedicines : [];
  const gmap = { Male: t('male'), Female: t('female'), Other: t('other') };
  const mmap = { Single: t('single'), Married: t('married'), Divorced: t('divorced'), Widowed: t('widowed') };
  const align = isUr ? { textAlign: 'right', writingDirection: 'rtl' } : null;

  return (
    <Screen>
      <Card>
        <InfoRow rtl={isUr} label={t('f_patientName')} value={patient.patientName} />
        <InfoRow rtl={isUr} label={t('f_father')} value={patient.fatherOrHusbandName} />
        <InfoRow rtl={isUr} label={t('f_age')} value={patient.age} />
        <InfoRow rtl={isUr} label={t('f_gender')} value={gmap[patient.gender] || patient.gender} />
        <InfoRow rtl={isUr} label={t('f_phone')} value={patient.phone} />
        <InfoRow rtl={isUr} label={t('f_email')} value={patient.email} />
        <InfoRow rtl={isUr} label={t('f_marital')} value={mmap[patient.maritalStatus] || patient.maritalStatus} />
        <InfoRow rtl={isUr} label={t('f_bp')} value={patient.bp} />
        <InfoRow rtl={isUr} label={t('f_sugar')} value={patient.sugar} />
        <InfoRow rtl={isUr} label={t('f_visit')} value={visitOf(patient)} />
        <InfoRow rtl={isUr} label={t('f_city')} value={patient.city} />
        <InfoRow rtl={isUr} label={t('f_country')} value={patient.country} />
        <InfoRow rtl={isUr} label={t('f_address')} value={patient.address} />
        <InfoRow rtl={isUr} label={t('f_symptoms')} value={patient.Symptoms} />
        <InfoRow rtl={isUr} label={t('d_registered')} value={formatDate(patient.date)} />
      </Card>

      {meds.length > 0 && (
        <Card>
          <Text style={[{ fontWeight: '800', fontSize: 16, marginBottom: 8 }, align]}>{t('d_meds')}</Text>
          {meds.map((m, i) => {
            const med = typeof m === 'string' ? { name: m, instruction: '' } : m;
            return (
              <Text key={i} style={{ writingDirection: 'rtl', textAlign: 'right', fontSize: 16, marginVertical: 3 }}>
                {i + 1}. {med.name}
                {med.instruction ? ' – ' + med.instruction : ''}
              </Text>
            );
          })}
        </Card>
      )}

      <Button title={t('d_edit')} variant="amber" onPress={() => navigation.navigate('EditPatient', { id })} style={{ marginBottom: 10 }} />
      <Button title={t('d_reco')} onPress={() => navigation.navigate('Recommend', { id })} />
    </Screen>
  );
}
