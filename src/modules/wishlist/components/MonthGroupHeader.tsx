import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../shared/ui/theme';

interface MonthGroupHeaderProps {
  month: string;
  year: number;
}

export function MonthGroupHeader({ month, year }: MonthGroupHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{month} {year}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.burgundy,
    fontSize: 16,
    fontWeight: '700',
  },
});
