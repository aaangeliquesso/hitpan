import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/ui/theme';

type ProductTagBadgeType = 'price' | 'gift' | 'category';

interface ProductTagBadgeProps {
  type: ProductTagBadgeType;
  label: string;
}

export function ProductTagBadge({ type, label }: ProductTagBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        type === 'gift' ? styles.giftBadge : styles.priceBadge,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          type === 'gift' ? styles.giftLabel : styles.priceLabel,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    maxWidth: '100%',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
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
