import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../ui/theme';

const STAR_ICON_SIZE = 16;
const STAR_INPUT_ICON_SIZE = 24;

interface StarRatingProps {
  rating: number;
  size?: number;
}

export function StarRating({
  rating,
  size = STAR_ICON_SIZE,
}: StarRatingProps) {
  const boundedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <View
      accessibilityLabel={`Rating: ${boundedRating} out of 5`}
      style={styles.row}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Ionicons
          color={
            index < boundedRating
              ? colors.ratingStar
              : colors.ratingStarEmpty
          }
          key={index}
          name={index < boundedRating ? 'star' : 'star-outline'}
          size={size}
        />
      ))}
    </View>
  );
}

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({
  rating,
  onRatingChange,
  disabled = false,
}: StarRatingInputProps) {
  const boundedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <View accessibilityLabel="Star rating" style={styles.row}>
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const selected = value <= boundedRating;
        return (
          <Pressable
            accessibilityLabel={`Set rating to ${value} out of 5`}
            accessibilityRole="radio"
            accessibilityState={{ checked: boundedRating === value }}
            disabled={disabled}
            hitSlop={8}
            key={value}
            onPress={() => onRatingChange(value)}
            style={[
              styles.inputStarButton,
              selected && styles.selectedInputStarButton,
            ]}
          >
            <Ionicons
              color={selected ? colors.ratingStar : colors.ratingStarEmpty}
              name={selected ? 'star' : 'star-outline'}
              size={STAR_INPUT_ICON_SIZE}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
  inputStarButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  selectedInputStarButton: {
    backgroundColor: '#FFF4D6',
  },
});
