import type { ProgressLog, VanityItem } from '../../types';
import { colors } from '../../shared/ui/theme';

type ProgressPercentageLog = Pick<ProgressLog, 'progress_percentage'>;
type ProgressPercentageItem = Pick<VanityItem, 'current_progress'> &
  Partial<Pick<VanityItem, 'progress_percentage'>>;

export function getCurrentProgressPercentage(
  item: ProgressPercentageItem,
  latestLog?: ProgressPercentageLog,
): number {
  return (
    latestLog?.progress_percentage ??
    item.progress_percentage ??
    item.current_progress
  );
}

export function getProgressTextColor(progressValue: number) {
  return progressValue === 100 ? colors.progressComplete : colors.brand;
}
