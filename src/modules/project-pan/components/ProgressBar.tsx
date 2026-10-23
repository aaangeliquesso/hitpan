import { StyleSheet, View } from 'react-native';
import { colors } from '../../../shared/ui/theme';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const boundedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: boundedProgress }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${boundedProgress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    overflow: 'hidden',
    backgroundColor: colors.border,
    borderRadius: 4,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.burgundy,
    borderRadius: 4,
  },
});
