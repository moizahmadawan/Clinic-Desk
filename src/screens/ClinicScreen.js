import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, Button, Field, Card } from '../components/ui';
import { useLang } from '../i18n';
import { colors } from '../theme';

const KEY = 'clinicNotes';

// Purane notes (sirf text) ko naye format {id, title, text} mein badal do
const normalize = (list) =>
  (Array.isArray(list) ? list : []).map((n, i) =>
    typeof n === 'string'
      ? { id: String(Date.now() + i), title: '', text: n }
      : { id: n.id || String(Date.now() + i), title: n.title || '', text: n.text || '' }
  );

export default function ClinicScreen() {
  const { t, isUr } = useLang();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Notes phone mein save rehte hain (app band karne ke baad bhi)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setNotes(normalize(JSON.parse(raw)));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify(notes)).catch(() => {});
  }, [notes, loaded]);

  const reset = () => {
    setTitle('');
    setText('');
    setEditingId(null);
  };

  const addOrUpdate = () => {
    const ti = title.trim();
    const tx = text.trim();
    if (!ti && !tx) {
      Alert.alert(t('error'), t('c_empty'));
      return;
    }
    if (editingId !== null) {
      setNotes((prev) => prev.map((n) => (n.id === editingId ? { ...n, title: ti, text: tx } : n)));
    } else {
      setNotes((prev) => [...prev, { id: String(Date.now()), title: ti, text: tx }]);
    }
    reset();
  };

  const edit = (n) => {
    setTitle(n.title);
    setText(n.text);
    setEditingId(n.id);
  };

  const remove = (n) => {
    Alert.alert(t('c_delTitle'), t('c_delMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('c_delete'),
        style: 'destructive',
        onPress: () => {
          setNotes((prev) => prev.filter((x) => x.id !== n.id));
          if (editingId === n.id) reset();
        },
      },
    ]);
  };

  const align = isUr ? { textAlign: 'right', writingDirection: 'rtl' } : null;

  return (
    <Screen>
      <Field rtl={isUr} placeholder={t('c_titlePh')} value={title} onChangeText={setTitle} />
      <Field rtl={isUr} placeholder={t('c_textPh')} value={text} onChangeText={setText} multiline inputStyle={{ minHeight: 100 }} />
      <Button title={editingId !== null ? t('c_update') : t('c_add')} onPress={addOrUpdate} />
      {editingId !== null && (
        <Button title={t('c_cancelEdit')} variant="outline" onPress={reset} style={{ marginTop: 8 }} />
      )}

      <Text style={[styles.total, align]}>{t('c_total', { n: notes.length })}</Text>

      {notes.length === 0 ? (
        <Text style={styles.empty}>{t('c_none')}</Text>
      ) : (
        notes.map((n, i) => (
          <Card key={n.id}>
            <View style={{ flexDirection: isUr ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 6 }}>
              <View style={[styles.badge, isUr ? { marginLeft: 10, marginRight: 0 } : null]}>
                <Text style={styles.badgeText}>{i + 1}</Text>
              </View>
              <Text style={[styles.noteTitle, { flex: 1 }, align]}>
                {n.title || t('c_untitled', { n: i + 1 })}
              </Text>
            </View>
            {n.text ? <Text style={[styles.noteText, align]}>{n.text}</Text> : null}
            <View style={{ flexDirection: isUr ? 'row-reverse' : 'row', gap: 8, marginTop: 10 }}>
              <Button small variant="amber" title={t('c_edit')} onPress={() => edit(n)} />
              <Button small variant="danger" title={t('c_delete')} onPress={() => remove(n)} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { marginTop: 18, marginBottom: 10, fontWeight: '800', color: colors.text },
  empty: { textAlign: 'center', color: colors.muted },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeText: { fontWeight: '800', color: colors.greenDark, fontSize: 13 },
  noteTitle: { fontWeight: '800', color: colors.greenDark, fontSize: 16 },
  noteText: { fontSize: 15, color: colors.text, lineHeight: 21 },
});
