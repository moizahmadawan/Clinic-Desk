import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Screen, Button, Card } from '../components/ui';
import { colors } from '../theme';

const MedicineImg = require('../../assets/Hero1.jpg');

const medicineData = {
  name: 'Herbal Immunity Booster',
  price: 'Rs. 500',
  description: 'This herbal remedy boosts your natural immunity using ancient Unani ingredients.',
  benefits: [
    'Strengthens immune system',
    'Improves digestion',
    'Reduces fatigue',
    '100% natural – No side effects',
  ],
};

export default function BuyScreen() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Screen>
      <Text style={styles.title}>Boost Your Natural Immunity</Text>

      {!showDetails ? (
        <Button title="Read More" onPress={() => setShowDetails(true)} />
      ) : (
        <Card>
          <Text style={styles.name}>{medicineData.name}</Text>
          <Image source={MedicineImg} style={styles.img} resizeMode="cover" />
          <Text style={styles.price}>Price: {medicineData.price}</Text>
          <Text style={styles.desc}>{medicineData.description}</Text>
          <View style={{ marginVertical: 10 }}>
            {medicineData.benefits.map((b, i) => (
              <Text key={i} style={styles.benefit}>
                ✅ {b}
              </Text>
            ))}
          </View>
          <Button title="Close" variant="outline" onPress={() => setShowDetails(false)} />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center', marginVertical: 16 },
  name: { fontSize: 20, fontWeight: '800', color: colors.greenDark, marginBottom: 10 },
  img: { width: '100%', height: 200, borderRadius: 12 },
  price: { fontSize: 17, fontWeight: '800', marginTop: 12 },
  desc: { fontSize: 14.5, color: '#333', marginTop: 6, lineHeight: 21 },
  benefit: { fontSize: 15, marginVertical: 3, color: colors.text },
});
