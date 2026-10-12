import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Screen, Button } from '../components/ui';
import { colors } from '../theme';

const Logo = require('../../assets/logo2.png');
const Hero = require('../../assets/Hero.png');

const FEATURES = [
  { key: 'Register', label: 'Registration', icon: require('../../assets/Registration.png') },
  { key: 'Patients', label: 'Registered Patients', icon: require('../../assets/Register.png') },
  { key: 'Prescriptions', label: 'Prescription', icon: require('../../assets/Prescription.png') },
  { key: 'Medicine', label: 'Medicine', icon: require('../../assets/Medicine.png') },
  { key: 'Clinic', label: 'Clinic Notes', icon: require('../../assets/Clinic.png') },
  { key: 'logout', label: 'Log Out', icon: require('../../assets/logout.png') },
];

export default function HomeScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert('Log Out', 'Kya aap log out karna chahte hain?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (e) {
            Alert.alert('Error', 'Log out nahi ho saka.');
          }
        },
      },
    ]);
  };

  const onPress = (key) => (key === 'logout' ? handleLogout() : navigation.navigate(key));

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']} contentStyle={{ padding: 0 }}>
      <View style={styles.topbar}>
        <Image source={Logo} style={styles.topLogo} resizeMode="contain" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.brand}>Madni Dukhana</Text>
          <Text style={styles.brandSub}>Gujrat • Since 1976</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.tagline}>Since 1976</Text>
        <Text style={styles.heroTitle}>BOOST YOUR{'\n'}NATURAL IMMUNITY</Text>
        <Text style={styles.desc}>
          At our Dua Khana, we offer time-tested herbal remedies rooted in the wisdom of ancient
          Unani medicine. Each treatment is prepared from pure, natural ingredients without any
          harmful chemicals, helping to heal the body from within. Our experienced Hakeems diagnose
          every patient carefully and prescribe herbal solutions to boost immunity, restore
          strength, and maintain overall well-being.
        </Text>
        <Button
          title="Read More"
          variant="dark"
          small
          onPress={() => navigation.navigate('Buy')}
          style={{ alignSelf: 'flex-start', marginTop: 14 }}
        />
        <Image source={Hero} style={styles.heroImg} resizeMode="contain" />
      </View>

      <View style={styles.grid}>
        {FEATURES.map((f) => (
          <TouchableOpacity
            key={f.key}
            activeOpacity={0.8}
            style={styles.tile}
            onPress={() => onPress(f.key)}
          >
            <Image source={f.icon} style={styles.tileIcon} resizeMode="contain" />
            <Text style={styles.tileText}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topLogo: { width: 46, height: 46 },
  brand: { fontSize: 18, fontWeight: '800', color: colors.text },
  brandSub: { fontSize: 12, color: colors.muted },
  hero: {
    backgroundColor: colors.green,
    margin: 14,
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  tagline: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#111', marginVertical: 8 },
  desc: { fontSize: 13.5, lineHeight: 20, color: '#1c2b0e' },
  heroImg: { width: '100%', height: 200, marginTop: 14 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  tile: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tileIcon: { width: 44, height: 44, marginBottom: 8 },
  tileText: { fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' },
});
