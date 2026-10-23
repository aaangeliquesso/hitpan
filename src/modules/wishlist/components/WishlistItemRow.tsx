import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { WishlistItem } from '../../../types';
import { colors } from '../../../shared/ui/theme';

interface WishlistItemRowProps {
  item: WishlistItem;
  rowNumber: number;
  saving: boolean;
  onToggleBought: () => void;
  onToggleNeed: (value: boolean) => void;
}

export function WishlistItemRow({
  item,
  rowNumber,
  saving,
  onToggleBought,
  onToggleNeed,
}: WishlistItemRowProps) {
  return (
    <View style={[styles.row, rowNumber % 2 === 0 && styles.alternate]}>
      <Text style={styles.index}>{item.row_number ?? rowNumber}</Text>
      <Text style={styles.day}>{item.day}</Text>
      <Text numberOfLines={1} style={styles.item}>
        {item.item_name}
      </Text>
      <Pressable
        accessibilityLabel={`${item.is_bought ? 'Mark' : 'Unmark'} ${item.item_name} as bought`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.is_bought, disabled: saving }}
        disabled={saving}
        onPress={onToggleBought}
        style={styles.bought}
      >
        <Text style={[styles.checkmark, item.is_bought && styles.checked]}>
          {item.is_bought ? '✓' : ''}
        </Text>
      </Pressable>
      <View style={styles.need}>
        <Switch
          accessibilityLabel={`Mark ${item.item_name} as a need`}
          disabled={saving}
          onValueChange={onToggleNeed}
          trackColor={{ false: '#E4D8D0', true: '#9CCBC7' }}
          thumbColor={item.is_need ? colors.success : '#FFFDF9'}
          value={item.is_need}
          style={styles.switch}
        />
      </View>
    </View>
  );
}

export function WishlistTableHeader() {
  return (
    <View style={styles.header}>
      <Text style={[styles.headerText, styles.index]}>#</Text>
      <Text style={[styles.headerText, styles.day]}>Day</Text>
      <Text style={[styles.headerText, styles.item]}>Item</Text>
      <Text style={[styles.headerText, styles.bought]}>Bought</Text>
      <Text style={[styles.headerText, styles.need]}>Need?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 7,
    backgroundColor: '#EDE5DF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  row: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: colors.warmWhite,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  alternate: {
    backgroundColor: '#F5E7E8',
  },
  index: {
    width: '8%',
    textAlign: 'center',
  },
  day: {
    width: '12%',
    textAlign: 'center',
  },
  item: {
    flex: 1,
    color: colors.text,
    fontSize: 9,
    paddingHorizontal: 3,
  },
  bought: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 18,
    height: 18,
    color: 'transparent',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  checked: {
    color: colors.success,
    backgroundColor: '#E6F1E6',
    borderColor: '#B7CFB6',
  },
  need: {
    width: '16%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.64 }, { scaleY: 0.64 }],
    marginHorizontal: -7,
  },
});
