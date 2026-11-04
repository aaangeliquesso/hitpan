import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../shared/ui/theme';

type ProductTagBadgeType = 'price' | 'gift';

interface ProductTagBadgeProps {
  type: ProductTagBadgeType;
  label: string;
}

export function ProductTagBadge({ type, label }: ProductTagBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        type === 'price' ? styles.priceBadge : styles.giftBadge,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          type === 'price' ? styles.priceLabel : styles.giftLabel,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: '100%',
    minHeight: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  priceBadge: {
    backgroundColor: '#FDF2F4',
  },
  giftBadge: {
    backgroundColor: '#E8F5E9',
  },
  priceLabel: {
    color: colors.brand,
  },
  giftLabel: {
    color: '#1E4D2B',
  },
});
