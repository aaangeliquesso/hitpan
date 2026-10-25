import { StyleSheet, View } from 'react-native';
import { colors } from '../../../shared/ui/theme';

interface ProgressBarProps {
  progress: number;
  finished?: boolean;
}

export function ProgressBar({ progress, finished = false }: ProgressBarProps) {
  const boundedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: boundedProgress }}
      style={styles.track}
    >
      <View
        style={[
          styles.fill,
          finished && styles.finishedFill,
          { width: `${boundedProgress}%` },
        ]}
      />
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
    backgroundColor: '#D9829A',
    borderRadius: 4,
  },
  finishedFill: {
    backgroundColor: colors.success,
  },
});
