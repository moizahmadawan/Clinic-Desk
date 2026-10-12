import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

// Keyboard khulne par jis box mein likh rahe hon use keyboard ke upar le aata hai
const KeyboardCtx = createContext(null);

export function Screen({
  children,
  scroll = true,
  edges = ['bottom', 'left', 'right'],
  contentStyle,
  refreshControl,
}) {
  const scrollRef = useRef(null);
  const scrollY = useRef(0);
  const kbHeight = useRef(0);
  const kbTop = useRef(0);
  const [kb, setKb] = useState(0);

  const reveal = useCallback(() => {
    if (!kbHeight.current || !scrollRef.current) return;
    const input = TextInput.State && TextInput.State.currentlyFocusedInput
      ? TextInput.State.currentlyFocusedInput()
      : null;
    if (!input || !input.measureInWindow) return;
    input.measureInWindow((x, y, w, h) => {
      const top = kbTop.current || Dimensions.get('window').height - kbHeight.current;
      const over = y + h + 48 - top; // 48 = box ke neeche thori khali jagah
      if (over > 0 && scrollRef.current) {
        scrollRef.current.scrollTo({ y: scrollY.current + over, animated: true });
      }
    });
  }, []);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(showEvt, (e) => {
      kbHeight.current = e.endCoordinates.height;
      kbTop.current = e.endCoordinates.screenY || 0;
      setKb(e.endCoordinates.height);
      setTimeout(reveal, 120); // pehle neeche khali jagah banne do, phir scroll
    });
    const h = Keyboard.addListener(hideEvt, () => {
      kbHeight.current = 0;
      kbTop.current = 0;
      setKb(0);
    });
    return () => {
      s.remove();
      h.remove();
    };
  }, [reveal]);

  const ctx = useRef({ reveal: () => setTimeout(reveal, 120) }).current;

  const inner = scroll ? (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[styles.content, contentStyle, kb ? { paddingBottom: kb + 60 } : null]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      onScroll={(e) => {
        scrollY.current = e.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }, contentStyle]}>{children}</View>
  );

  return (
    <KeyboardCtx.Provider value={ctx}>
      <SafeAreaView style={styles.screen} edges={edges}>
        <View style={{ flex: 1 }}>{inner}</View>
      </SafeAreaView>
    </KeyboardCtx.Provider>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  small = false,
  disabled = false,
  loading = false,
  style,
}) {
  const bg = {
    primary: colors.green,
    danger: colors.danger,
    blue: colors.blue,
    amber: colors.amber,
    dark: '#222',
    outline: 'transparent',
  }[variant];
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: bg },
        isOutline && { borderWidth: 1.5, borderColor: colors.green },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.green : '#fff'} />
      ) : (
        <Text
          style={[
            styles.btnText,
            small && { fontSize: 13 },
            isOutline && { color: colors.greenDark },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function Field({ label, style, inputStyle, multiline, rtl, onFocus, ...props }) {
  const kbCtx = useContext(KeyboardCtx);
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label ? <Text style={[styles.label, rtl && { textAlign: 'right', writingDirection: 'rtl' }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#9aa0a6"
        multiline={multiline}
        style={[
          styles.input,
          multiline && { minHeight: 70, textAlignVertical: 'top' },
          rtl && { textAlign: 'right', writingDirection: 'rtl' },
          props.editable === false && { backgroundColor: '#eef0f3', color: '#666' },
          inputStyle,
        ]}
        onFocus={(e) => {
          if (onFocus) onFocus(e);
          if (kbCtx) kbCtx.reveal();
        }}
        {...props}
      />
    </View>
  );
}

export function Chip({ label, selected, onPress, rtl, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected, style]}
    >
      <Text
        style={[
          styles.chipText,
          selected && { color: '#fff', fontWeight: '700' },
          rtl && { writingDirection: 'rtl' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function ChoiceRow({ label, options, value, onChange, rtl }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={[styles.label, rtl && { textAlign: 'right', writingDirection: 'rtl' }]}>{label}</Text> : null}
      <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => {
          const val = typeof o === 'string' ? o : o.value;
          const lab = typeof o === 'string' ? o : o.label;
          return <Chip key={val} label={lab} rtl={rtl} selected={value === val} onPress={() => onChange(val)} />;
        })}
      </View>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function InfoRow({ label, value, rtl }) {
  const align = rtl ? { textAlign: 'right', writingDirection: 'rtl' } : null;
  return (
    <View style={[styles.infoRow, rtl && { flexDirection: 'row-reverse' }]}>
      <Text style={[styles.infoLabel, align]}>{label}</Text>
      <Text style={[styles.infoValue, align]}>{value ? String(value) : '-'}</Text>
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <ActivityIndicator size="large" color={colors.green} />
    </View>
  );
}

export function formatDate(d) {
  if (!d) return '-';
  return String(d).replace('T', '  ');
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  btn: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 5 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.text,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { fontSize: 14, color: colors.text },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoLabel: { width: 130, fontWeight: '700', color: colors.text },
  infoValue: { flex: 1, color: '#333' },
});
