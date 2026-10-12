import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

/**
 * Kisi bhi list (dawaiyan / hidayat) ko add, edit, remove karne ki screen.
 * onChange(newItems, info)  ->  info.renamed = { from, to } (jab naam badla jaye)
 */
export default function ListManagerModal({ visible, title, items, onChange, onClose, t, rtl }) {
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (!visible) {
      setText('');
      setFilter('');
      setEditIndex(null);
      setEditText('');
    }
  }, [visible]);

  const rows = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return items.map((name, index) => ({ name, index })).filter((r) => !f || r.name.toLowerCase().includes(f));
  }, [items, filter]);

  const add = () => {
    const v = text.trim();
    if (!v) return;
    if (items.includes(v)) {
      Alert.alert(t('m_exists'));
      return;
    }
    onChange([...items, v]);
    setText('');
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditText(items[index]);
  };

  const saveEdit = () => {
    const v = editText.trim();
    if (!v) return;
    if (items.some((x, i) => x === v && i !== editIndex)) {
      Alert.alert(t('m_exists'));
      return;
    }
    const from = items[editIndex];
    onChange(
      items.map((x, i) => (i === editIndex ? v : x)),
      from !== v ? { renamed: { from, to: v } } : undefined
    );
    setEditIndex(null);
    setEditText('');
  };

  const remove = (index) => {
    Alert.alert(t('m_delete'), t('m_delConfirm', { name: items[index] }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('m_delete'),
        style: 'destructive',
        onPress: () => {
          onChange(items.filter((_, i) => i !== index), { removed: items[index] });
          if (editIndex === index) setEditIndex(null);
        },
      },
    ]);
  };

  const align = { textAlign: 'right', writingDirection: 'rtl' };

  const renderItem = ({ item }) => {
    const editing = editIndex === item.index;
    return (
      <View style={styles.row}>
        {editing ? (
          <>
            <TextInput
              style={[styles.input, { flex: 1 }, align]}
              value={editText}
              onChangeText={setEditText}
              autoFocus
            />
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.green }]} onPress={saveEdit}>
              <Text style={styles.btnText}>{t('m_save')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#888' }]} onPress={() => setEditIndex(null)}>
              <Text style={styles.btnText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.itemText, align]}>{item.name}</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.amber }]} onPress={() => startEdit(item.index)}>
              <Text style={styles.btnText}>{t('m_edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.danger }]} onPress={() => remove(item.index)}>
              <Text style={styles.btnText}>{t('m_delete')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>{t('m_close')}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, { flex: 1 }, align]}
              placeholder={t('m_addPh')}
              placeholderTextColor="#9aa0a6"
              value={text}
              onChangeText={setText}
              onSubmitEditing={add}
            />
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.green, paddingVertical: 12 }]} onPress={add}>
              <Text style={styles.btnText}>{t('add')}</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { marginHorizontal: 14, marginBottom: 6 }, align]}
            placeholder="🔍"
            placeholderTextColor="#9aa0a6"
            value={filter}
            onChangeText={setFilter}
          />
          <Text style={styles.count}>{t('m_count', { n: items.length })}</Text>

          <FlatList
            data={rows}
            keyExtractor={(r) => r.name + '#' + r.index}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 30 }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '800' },
  closeBtn: { backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 14 },
  closeText: { color: '#fff', fontWeight: '800' },
  addRow: { flexDirection: 'row', gap: 8, padding: 14, paddingBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  count: { marginHorizontal: 16, marginBottom: 6, color: colors.muted, fontSize: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  itemText: { flex: 1, fontSize: 17, color: colors.text, paddingHorizontal: 4 },
  btn: { paddingVertical: 8, paddingHorizontal: 11, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
