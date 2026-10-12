import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Screen, Loading } from '../components/ui';
import PatientEditForm from '../components/PatientEditForm';
import { useLang } from '../i18n';

export default function EditPatientScreen({ navigation, route }) {
  const { id } = route.params;
  const { t } = useLang();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'patients', id));
        if (!snap.exists()) {
          Alert.alert(t('error'), t('d_notFound'));
          navigation.goBack();
          return;
        }
        setPatient({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error('Error fetching patient:', e);
        Alert.alert(t('error'), t('d_loadErr'));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!patient) return <Loading />;

  return (
    <Screen>
      <PatientEditForm
        patient={patient}
        onSaved={() => {
          Alert.alert('✅', t('e_saved'));
          navigation.goBack();
        }}
      />
    </Screen>
  );
}
