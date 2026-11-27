import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  variant?: 'destructive' | 'neutral';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText,
  cancelText = 'Keep',
  variant = 'neutral',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && !loading && styles.pressed,
              ]}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                variant === 'destructive'
                  ? styles.destructiveButton
                  : styles.neutralButton,
                pressed && !loading && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmText}>{confirmText}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
  },
  title: {
    marginBottom: 8,
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
  },
  message: {
    marginBottom: 24,
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  destructiveButton: {
    backgroundColor: '#7A2033',
  },
  neutralButton: {
    backgroundColor: '#1E4D2B',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.65,
  },
});
