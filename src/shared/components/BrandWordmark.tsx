import { Image, StyleSheet, View } from 'react-native';

interface BrandWordmarkProps {
  color?: 'burgundy' | 'white';
  width?: number;
}

const logos = {
  burgundy: require('../../../logo/burgundy-primary-logo.png'),
  white: require('../../../logo/white-primary-logo.png'),
};

export function BrandWordmark({
  color = 'burgundy',
  width = 112,
}: BrandWordmarkProps) {
  return (
    <View style={[styles.container, { width, height: width * 0.28 }]}>
      <Image
        accessibilityLabel="hitpan"
        resizeMode="contain"
        source={logos[color]}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
