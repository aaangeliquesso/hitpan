import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../../shared/ui/theme';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const boundedProgress = Math.max(0, Math.min(100, progress));
  const animatedProgress = useRef(
    new Animated.Value(boundedProgress),
  ).current;
  const fillColor = animatedProgress.interpolate({
    inputRange: [99, 100],
    outputRange: [colors.brand, '#3a6546'],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const animation = Animated.timing(animatedProgress, {
      toValue: boundedProgress,
      duration: 220,
      useNativeDriver: false,
    });
    animation.start();

    return () => animation.stop();
  }, [animatedProgress, boundedProgress]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: boundedProgress }}
      style={styles.track}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: fillColor },
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
    borderRadius: 4,
  },
});
