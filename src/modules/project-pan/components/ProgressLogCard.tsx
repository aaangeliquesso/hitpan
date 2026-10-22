import { Image, StyleSheet, Text, View } from 'react-native';
import type { ProgressLog } from '../../../types';
import { colors, spacing } from '../../../shared/ui/theme';

interface ProgressLogCardProps {
  log: ProgressLog;
}

export function ProgressLogCard({ log }: ProgressLogCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: log.photo_url }} style={styles.photo} />
      <View style={styles.details}>
        <Text style={styles.date}>
          {new Date(log.logged_at).toLocaleString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
        <Text style={styles.percentage}>{log.progress_percentage}% update</Text>
        {log.notes ? (
          <Text numberOfLines={2} style={styles.notes}>
            Note: {log.notes}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    gap: spacing.md,
  },
  photo: {
    width: 74,
    height: 88,
    backgroundColor: colors.border,
    borderRadius: 10,
  },
  details: {
    flex: 1,
    gap: spacing.xs,
  },
  percentage: {
    color: colors.burgundy,
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    color: colors.text,
    fontSize: 12,
  },
  notes: {
    color: colors.text,
    fontSize: 14,
  },
});
