// Chhota sa apna navigation (koi @react-navigation / expo-router ki zaroorat nahi)
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BackHandler, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './theme';
import { useLang } from './i18n';

let keyCounter = 0;
const makeEntry = (name, params) => ({ name, params: params || {}, key: ++keyCounter });

/**
 * screens: { Name: { component, title, headerShown?, initialParams? } }
 */
function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <View style={styles.toggle}>
      <TouchableOpacity onPress={() => setLang('en')} style={[styles.pill, lang === 'en' && styles.pillOn]}>
        <Text style={[styles.pillText, lang === 'en' && styles.pillTextOn]}>EN</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setLang('ur')} style={[styles.pill, lang === 'ur' && styles.pillOn]}>
        <Text style={[styles.pillText, lang === 'ur' && styles.pillTextOn]}>اردو</Text>
      </TouchableOpacity>
    </View>
  );
}

export function Navigator({ screens, initialRoute }) {
  const { lang } = useLang();
  const [stack, setStack] = useState(() => [makeEntry(initialRoute)]);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const navigation = useMemo(
    () => ({
      navigate: (name, params) => setStack((s) => [...s, makeEntry(name, params)]),
      replace: (name, params) => setStack((s) => [...s.slice(0, -1), makeEntry(name, params)]),
      goBack: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    }),
    []
  );

  // Android ka back button
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stackRef.current.length > 1) {
        navigation.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [navigation]);

  const top = stack[stack.length - 1];
  const cfg = screens[top.name];
  if (!cfg) return null;

  const Component = cfg.component;
  const title =
    cfg.title && typeof cfg.title === 'object' ? cfg.title[lang] || cfg.title.en : cfg.title || top.name;
  const sideW = cfg.langToggle ? 96 : 44;
  const route = { name: top.name, params: { ...(cfg.initialParams || {}), ...top.params } };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {cfg.headerShown === false ? null : (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.header}>
          <View style={styles.headerRow}>
            {stack.length > 1 ? (
              <TouchableOpacity onPress={navigation.goBack} style={[styles.backBtn, { width: sideW, alignItems: 'flex-start', paddingLeft: 10 }]} hitSlop={10}>
                <Text style={styles.backText}>‹</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: sideW }} />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <View style={{ width: sideW, alignItems: 'flex-end', paddingRight: 8 }}>
              {cfg.langToggle ? <LangToggle /> : null}
            </View>
          </View>
        </SafeAreaView>
      )}
      <View style={{ flex: 1 }}>
        <Component key={top.key} navigation={navigation} route={route} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.green },
  headerRow: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 },
  backBtn: { width: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 38, lineHeight: 42, fontWeight: '300' },
  title: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: '800' },
  toggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 16, padding: 2 },
  pill: { paddingVertical: 4, paddingHorizontal: 9, borderRadius: 14 },
  pillOn: { backgroundColor: '#fff' },
  pillText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  pillTextOn: { color: colors.greenDark },
});
