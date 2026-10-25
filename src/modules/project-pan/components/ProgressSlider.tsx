import { useMemo, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { colors } from '../../../shared/ui/theme';

interface ProgressSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value / 10) * 10));
}

export function ProgressSlider({ value, onValueChange }: ProgressSliderProps) {
  const [width, setWidth] = useState(0);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          if (width > 24) {
            onValueChange(
              clampProgress(
                ((event.nativeEvent.locationX - 12) / (width - 24)) * 100,
              ),
            );
          }
        },
        onPanResponderMove: (event) => {
          if (width > 24) {
            onValueChange(
              clampProgress(
                ((event.nativeEvent.locationX - 12) / (width - 24)) * 100,
              ),
            );
          }
        },
      }),
    [onValueChange, width],
  );

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  function handleAccessibilityAction(event: AccessibilityActionEvent) {
    if (event.nativeEvent.actionName === 'increment') {
      onValueChange(clampProgress(value + 10));
    } else if (event.nativeEvent.actionName === 'decrement') {
      onValueChange(clampProgress(value - 10));
    }
  }

  return (
    <View
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      accessibilityLabel="Initial progress"
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: 100, now: value, text: `${value}%` }}
      onAccessibilityAction={handleAccessibilityAction}
      onLayout={handleLayout}
      style={styles.slider}
      {...panResponder.panHandlers}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%` }]} />
        {Array.from({ length: 11 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.tick,
              { left: `${index * 10}%` },
              index * 10 <= value && styles.activeTick,
            ]}
          />
        ))}
        <View style={[styles.thumb, { left: `${value}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: '100%',
    height: 54,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 10,
    justifyContent: 'center',
    backgroundColor: '#E9DCD7',
    borderRadius: 5,
  },
  fill: {
    height: 6,
    backgroundColor: colors.burgundy,
    borderRadius: 5,
    marginLeft: 2,
  },
  tick: {
    position: 'absolute',
    width: 3,
    height: 3,
    marginLeft: -1.5,
    backgroundColor: '#C9B9B3',
    borderRadius: 2,
  },
  activeTick: {
    backgroundColor: '#F7E9E7',
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12,
    backgroundColor: colors.warmWhite,
    borderColor: colors.burgundy,
    borderWidth: 7,
    borderRadius: 12,
    shadowColor: '#321719',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
