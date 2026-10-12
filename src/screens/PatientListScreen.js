import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Alert } from 'react-native';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Screen, Button, Field, Card, Loading, formatDate } from '../components/ui';
import { useLang } from '../i18n';
import { visitOf } from '../utils/patients';
import { colors } from '../theme';

/**
 * Teen modes (route.params.mode):
 *  - "manage"       : Registered Patients (Edit / Delete / View / Recommend)
 *  - "medicine"     : Medicine (sirf Recommend)
 *  - "prescription" : sirf wo patients jin ki recommendation save hai
 */
export default function PatientListScreen({ navigation, route }) {
  const mode = route.params?.mode || 'manage';
  const { t, isUr } = useLang();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const q = query(collection(db, 'patients'), orderBy('patientName'));
      const snap = await getDocs(q);
      setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Error fetching patients:', e);
      Alert.alert(t('error'), t('l_loadErr'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Screen har dafa naye sire se khulti hai, is liye edit ke baad naya data khud aa jata hai
  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = patients;
    if (mode === 'prescription') {
      list = list.filter((p) => Array.isArray(p.recommendedMedicines) && p.recommendedMedicines.length > 0);
    }
    if (!term) return list;
    return list.filter(
      (p) =>
        (p.patientName || '').toLowerCase().includes(term) ||
        (p.phone || '').toLowerCase().includes(term)
    );
  }, [patients, search, mode]);

  const confirmDelete = (p) => {
    Alert.alert(t('l_delTitle'), t('l_delMsg', { name: p.patientName }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('l_delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'patients', p.id));
            setPatients((prev) => prev.filter((x) => x.id !== p.id));
          } catch (e) {
            Alert.alert(t('error'), t('l_delErr'));
          }
        },
      },
    ]);
  };

  const heading =
    mode === 'prescription' ? t('h_prescriptions') : mode === 'medicine' ? t('h_medicine') : t('h_patients');

  const align = isUr ? { textAlign: 'right', writingDirection: 'rtl' } : null;

  const renderItem = ({ item, index }) => {
    const medCount = Array.isArray(item.recommendedMedicines) ? item.recommendedMedicines.length : 0;
    return (
      <Card>
        <View style={{ flexDirection: isUr ? 'row-reverse' : 'row', alignItems: 'center' }}>
          <View style={[styles.badge, isUr ? { marginLeft: 12, marginRight: 0 } : null]}>
            <Text style={styles.badgeText}>{index + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, align]}>{item.patientName}</Text>
            <Text style={[styles.meta, align]}>
              {t('l_sdw')}: {item.fatherOrHusbandName || '-'}
            </Text>
            {mode === 'manage' && (
              <Text style={[styles.meta, align]}>
                {t('l_agePhone', { age: item.age || '-', phone: item.phone || '-' })}
              </Text>
            )}
            <Text style={[styles.meta, align]}>
              {formatDate(item.date)}  •  {t('l_visit', { n: visitOf(item) })}
            </Text>
            {medCount > 0 && <Text style={[styles.medCount, align]}>💊 {t('l_meds', { n: medCount })}</Text>}
          </View>
        </View>

        <View style={[styles.actions, isUr && { flexDirection: 'row-reverse' }]}>
          {mode === 'manage' && (
            <>
              <Button small variant="blue" title={t('l_view')} onPress={() => navigation.navigate('PatientDetails', { id: item.id })} style={styles.act} />
              <Button small variant="amber" title={t('l_edit')} onPress={() => navigation.navigate('EditPatient', { id: item.id })} style={styles.act} />
              <Button small variant="danger" title={t('l_delete')} onPress={() => confirmDelete(item)} style={styles.act} />
            </>
          )}
          <Button
            small
            title={mode === 'prescription' ? t('l_open') : t('l_reco')}
            onPress={() => navigation.navigate('Recommend', { id: item.id })}
            style={styles.act}
          />
        </View>
      </Card>
    );
  };

  return (
    <Screen scroll={false} contentStyle={{ padding: 0 }}>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Field rtl={isUr} placeholder={t('l_search')} value={search} onChangeText={setSearch} style={{ marginBottom: 6 }} />
        <Text style={[styles.count, align]}>{t('l_total', { title: heading, n: filtered.length })}</Text>
      </View>

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingTop: 6 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              colors={[colors.green]}
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>{t('l_none')}</Text>}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: { color: colors.muted, fontSize: 13, marginBottom: 4 },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: { fontWeight: '800', color: colors.greenDark },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  medCount: { fontSize: 12, color: colors.greenDark, marginTop: 4, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  act: { flexGrow: 1 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
