import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../../shared/ui/theme';
import type { CreateWishlistItemInput } from '../services/wishlistService';

interface AddWishlistItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (input: CreateWishlistItemInput) => Promise<void>;
}

export function AddWishlistItemModal({
  visible,
  onClose,
  onSave,
}: AddWishlistItemModalProps) {
  const [itemName, setItemName] = useState('');
  const [isBought, setIsBought] = useState(false);
  const [isNeed, setIsNeed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setItemName('');
      setIsBought(false);
      setIsNeed(false);
      setError(null);
    }
  }, [visible]);

  async function submit() {
    const name = itemName.trim();
    if (!name) {
      setError('Item name is required.');
      return;
    }
    if (saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSave({ item_name: name, is_bought: isBought, is_need: isNeed });
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to add this wishlist item.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={() => {
        if (!saving) onClose();
      }}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add wishlist item</Text>
              <Text style={styles.subtitle}>Save something for later.</Text>
            </View>
            <Pressable
              accessibilityLabel="Close add wishlist item form"
              accessibilityRole="button"
              disabled={saving}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons color={colors.neutralIcon} name="close" size={22} />
            </Pressable>
          </View>

          <Text style={styles.label}>Item name *</Text>
          <TextInput
            editable={!saving}
            onChangeText={setItemName}
            placeholder="What would you like?"
            placeholderTextColor={colors.mutedText}
            returnKeyType="done"
            style={styles.input}
            value={itemName}
          />

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Bought</Text>
              <Text style={styles.toggleHint}>
                {isBought ? '✓ Bought' : '× Not bought'}
              </Text>
            </View>
            <Switch
              accessibilityLabel="Mark item as bought"
              disabled={saving}
              onValueChange={setIsBought}
              thumbColor={colors.backgroundPrimary}
              trackColor={{ false: colors.border, true: colors.brand }}
              value={isBought}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Need</Text>
              <Text style={styles.toggleHint}>
                {isNeed ? '✓ Need' : '× Not a need'}
              </Text>
            </View>
            <Switch
              accessibilityLabel="Mark item as a need"
              disabled={saving}
              onValueChange={setIsNeed}
              thumbColor={colors.backgroundPrimary}
              trackColor={{ false: colors.border, true: colors.brand }}
              value={isNeed}
            />
          </View>

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={onClose}
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() => void submit()}
              style={[styles.actionButton, styles.saveButton]}
            >
              {saving ? (
                <ActivityIndicator color={colors.backgroundPrimary} />
              ) : (
                <Text style={styles.saveText}>Add item</Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 18, 18, 0.45)',
  },
  sheet: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.backgroundSecondary,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    minHeight: 46,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundPrimary,
    fontSize: 14,
  },
  toggleRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toggleText: {
    gap: 2,
  },
  toggleTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleHint: {
    color: colors.mutedText,
    fontSize: 12,
  },
  error: {
    marginTop: spacing.sm,
    color: colors.error,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  cancelButton: {
    width: 84,
    backgroundColor: colors.neutralSurface,
  },
  cancelText: {
    color: colors.neutralIcon,
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  saveText: {
    color: colors.backgroundPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
