import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Screen, Button, Field, Chip, Card, Loading } from '../components/ui';
import ListManagerModal from '../components/ListManagerModal';
import PatientEditForm from '../components/PatientEditForm';
import { DEFAULT_MEDICINES, INSTRUCTION_PRESETS } from '../data/medicines';
import { loadList, saveList } from '../utils/settingsStore';
import { nextVisitInfo, hasRecommendation, ymd } from '../utils/patients';
import { buildPrescriptionHtml } from '../utils/prescriptionHtml';
import { useLang } from '../i18n';
import { colors } from '../theme';

export default function RecommendScreen({ navigation, route }) {
  const { id } = route.params;
  const { t, isUr } = useLang();
  const [patient, setPatient] = useState(null);
  const [selected, setSelected] = useState([]); // [{name, instruction}]
  const [medicineList, setMedicineList] = useState(DEFAULT_MEDICINES);
  const [insList, setInsList] = useState(INSTRUCTION_PRESETS);
  const [customMed, setCustomMed] = useState('');
  const [activeMed, setActiveMed] = useState(null);
  const [lastTime, setLastTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showMeds, setShowMeds] = useState(false);
  const [showIns, setShowIns] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [meds, ins] = await Promise.all([
          loadList('medicines', DEFAULT_MEDICINES, 'customMedicines'),
          loadList('instructions', INSTRUCTION_PRESETS),
        ]);
        setMedicineList(meds);
        setInsList(ins);

        const snap = await getDoc(doc(db, 'patients', id));
        if (!snap.exists()) {
          Alert.alert(t('error'), t('d_notFound'));
          navigation.goBack();
          return;
        }
        const data = snap.data();
        setPatient({ id: snap.id, ...data });
        setSelected(
          (data.recommendedMedicines || []).map((m) => (typeof m === 'string' ? { name: m, instruction: '' } : m))
        );
        if (data.recommendationTime?.toDate) {
          setLastTime(data.recommendationTime.toDate().toLocaleString());
        }
      } catch (e) {
        console.error('Error fetching patient:', e);
        Alert.alert(t('error'), t('d_loadErr'));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isSelected = (name) => selected.some((m) => m.name === name);

  const toggle = (name) => {
    if (isSelected(name)) {
      setSelected((prev) => prev.filter((m) => m.name !== name));
      if (activeMed === name) setActiveMed(null);
    } else {
      setSelected((prev) => [...prev, { name, instruction: '' }]);
      setActiveMed(name);
    }
  };

  const setInstruction = (name, text) =>
    setSelected((prev) => prev.map((m) => (m.name === name ? { ...m, instruction: text } : m)));

  // ---- dawaiyon ki list (add / edit / remove)
  const changeMedicines = (items, info) => {
    setMedicineList(items);
    saveList('medicines', items);
    if (info?.renamed) {
      const { from, to } = info.renamed;
      setSelected((prev) => prev.map((m) => (m.name === from ? { ...m, name: to } : m)));
      if (activeMed === from) setActiveMed(to);
    }
  };

  // ---- hidayat / suggestions ki list (add / edit / remove)
  const changeInstructions = (items, info) => {
    setInsList(items);
    saveList('instructions', items);
    if (info?.renamed) {
      const { from, to } = info.renamed;
      setSelected((prev) => prev.map((m) => (m.instruction === from ? { ...m, instruction: to } : m)));
    }
  };

  const addCustom = () => {
    const name = customMed.trim();
    if (!name) return;
    if (!medicineList.includes(name)) changeMedicines([...medicineList, name]);
    setCustomMed('');
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const info = nextVisitInfo(patient); // naya din => visit +1
      const had = hasRecommendation(patient);
      const oldCount = patient.recommendationCount || 0;
      const count = !had ? 1 : info.isNew ? oldCount + 1 : Math.max(oldCount, 1);
      const today = ymd();

      await updateDoc(doc(db, 'patients', id), {
        recommendedMedicines: selected,
        recommendationTime: serverTimestamp(),
        visitNumber: info.next,
        recommendationCount: count,
        lastVisitDate: today,
      });

      setPatient((p) => ({ ...p, visitNumber: info.next, recommendationCount: count, lastVisitDate: today }));
      setMessage(t('r_saved', { n: info.next }));
      setLastTime(new Date().toLocaleString());
    } catch (e) {
      console.error(e);
      setMessage(t('r_saveFail'));
    } finally {
      setSaving(false);
    }
  };

  const html = () => buildPrescriptionHtml(patient, selected);

  const printIt = async () => {
    try {
      await Print.printAsync({ html: html(), width: 595, height: 842 });
    } catch (e) {
      Alert.alert(t('error'), t('r_printErr'));
    }
  };

  const sharePdf = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: html(), width: 595, height: 842 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Prescription' });
      } else {
        Alert.alert('PDF', uri);
      }
    } catch (e) {
      Alert.alert(t('error'), t('r_pdfErr'));
    }
  };

  if (!patient) return <Loading />;

  const visit = nextVisitInfo(patient);
  const align = isUr ? { textAlign: 'right', writingDirection: 'rtl' } : null;
  const secRow = [styles.secRow, isUr && { flexDirection: 'row-reverse' }];

  return (
    <Screen>
      <Card>
        <Text style={[styles.pName, align]}>{patient.patientName}</Text>
        <Text style={[styles.pMeta, align]}>
          {t('l_sdw')}: {patient.fatherOrHusbandName || '-'}
        </Text>
        <Text style={[styles.pMeta, align]}>
          {t('f_age')}: {patient.age || '-'}  •  {patient.gender || '-'}  •  {patient.maritalStatus || '-'}
        </Text>
        <Text style={[styles.pMeta, align]}>
          BP: {patient.bp || '-'}  •  Sugar: {patient.sugar || '-'}
        </Text>
        <Text style={[styles.pMeta, align]}>
          {t('f_symptoms')}: {patient.Symptoms || '-'}
        </Text>
        <View style={[styles.visitBadge, isUr && { alignSelf: 'flex-end' }]}>
          <Text style={styles.visitText}>
            {visit.isNew
              ? t('r_visitNew', { cur: visit.current, n: visit.next })
              : t('r_visitSame', { n: visit.current })}
          </Text>
        </View>
        {lastTime ? <Text style={[styles.last, align]}>{t('r_lastRec', { time: lastTime })}</Text> : null}
        <Button
          small
          variant="outline"
          title={showEdit ? t('r_hideEdit') : t('r_editPatient')}
          onPress={() => setShowEdit((v) => !v)}
          style={{ marginTop: 12, alignSelf: isUr ? 'flex-end' : 'flex-start' }}
        />
      </Card>

      {showEdit && (
        <Card>
          <PatientEditForm
            patient={patient}
            onSaved={(data) => {
              setPatient((p) => ({ ...p, ...data }));
              setShowEdit(false);
              setMessage(t('r_patientSaved'));
            }}
          />
        </Card>
      )}

      <View style={secRow}>
        <Text style={[styles.section, { flex: 1 }, align]}>{t('r_meds')}</Text>
        <Button small variant="outline" title={t('r_manageMeds')} onPress={() => setShowMeds(true)} />
      </View>
      <View style={styles.wrap}>
        {medicineList.map((m) => (
          <Chip key={m} label={m} rtl selected={isSelected(m)} onPress={() => toggle(m)} />
        ))}
      </View>

      <View style={[styles.addRow, isUr && { flexDirection: 'row-reverse' }]}>
        <Field
          placeholder={t('r_customPh')}
          value={customMed}
          onChangeText={setCustomMed}
          rtl
          style={{ flex: 1, marginBottom: 0 }}
        />
        <Button title={t('add')} small onPress={addCustom} style={{ marginHorizontal: 8, height: 46, alignSelf: 'flex-end' }} />
      </View>

      <View style={secRow}>
        <Text style={[styles.section, { flex: 1 }, align]}>{t('r_selected', { n: selected.length })}</Text>
        <Button small variant="outline" title={t('r_manageIns')} onPress={() => setShowIns(true)} />
      </View>
      {selected.length === 0 && <Text style={[{ color: colors.muted, marginBottom: 12 }, align]}>{t('r_none')}</Text>}

      {selected.map((med) => (
        <Card key={med.name} style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setActiveMed(activeMed === med.name ? null : med.name)}>
              <Text style={styles.medName}>{med.name}</Text>
              {med.instruction ? <Text style={styles.medIns}>{med.instruction}</Text> : <Text style={styles.hint}>{t('r_tapHint')}</Text>}
            </TouchableOpacity>
            <Button small variant="danger" title={t('remove')} onPress={() => toggle(med.name)} />
          </View>

          {activeMed === med.name && (
            <View style={{ marginTop: 10 }}>
              <Field
                placeholder={t('r_insPh')}
                value={med.instruction || ''}
                onChangeText={(txt) => setInstruction(med.name, txt)}
                rtl
              />
              <View style={styles.wrap}>
                {insList.map((p) => (
                  <Chip key={p} label={p} rtl selected={med.instruction === p} onPress={() => setInstruction(med.name, p)} />
                ))}
              </View>
            </View>
          )}
        </Card>
      ))}

      {message ? <Text style={styles.msg}>{message}</Text> : null}

      <Button title={t('r_save')} onPress={save} loading={saving} style={{ marginTop: 6 }} />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Button title={t('r_print')} variant="blue" onPress={printIt} style={{ flex: 1 }} />
        <Button title={t('r_share')} variant="dark" onPress={sharePdf} style={{ flex: 1 }} />
      </View>

      <ListManagerModal
        visible={showMeds}
        title={t('m_titleMeds')}
        items={medicineList}
        onChange={changeMedicines}
        onClose={() => setShowMeds(false)}
        t={t}
        rtl
      />
      <ListManagerModal
        visible={showIns}
        title={t('m_titleIns')}
        items={insList}
        onChange={changeInstructions}
        onClose={() => setShowIns(false)}
        t={t}
        rtl
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pName: { fontSize: 18, fontWeight: '800', color: colors.text },
  pMeta: { fontSize: 13, color: colors.muted, marginTop: 3 },
  visitBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.greenLight,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  visitText: { color: colors.greenDark, fontWeight: '800', fontSize: 13 },
  last: { fontSize: 12, color: colors.greenDark, marginTop: 8, fontWeight: '600' },
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 8 },
  section: { fontSize: 15, fontWeight: '800', color: colors.text },
  wrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  addRow: { flexDirection: 'row', marginBottom: 14 },
  medName: { fontSize: 18, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl', color: colors.text },
  medIns: { fontSize: 14, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  hint: { fontSize: 12, color: '#9aa0a6', textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  msg: { textAlign: 'center', marginVertical: 8, fontWeight: '600', color: colors.text },
});
