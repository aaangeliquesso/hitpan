import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../ui/theme';

interface StarRatingProps {
  rating: number;
}

export function StarRating({ rating }: StarRatingProps) {
  const boundedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <View accessibilityLabel={`Rating: ${boundedRating} out of 5`} style={styles.row}>
      {Array.from({ length: 5 }, (_, index) => (
        <Text key={index} style={index < boundedRating ? styles.filled : styles.empty}>
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  filled: {
    color: colors.accent,
    fontSize: 14,
  },
  empty: {
    color: colors.border,
    fontSize: 14,
  },
});
