const palette = {
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F9F9FB',
  textPrimary: '#121212',
  textSecondary: '#666666',
  border: '#E5E5E5',
  brand: '#7A2033',
  brandSurface: 'rgba(122, 32, 51, 0.08)',
  ratingStar: '#E6B800',
  ratingStarEmpty: '#D1D1D6',
  wishlistBought: '#7A2033',
  wishlistBoughtSurface: '#FDF2F4',
  wishlistNeed: '#1E4D2B',
  wishlistNeedSurface: '#E8F5E9',
  switchInactive: '#E5E5EA',
  switchThumb: '#FFFFFF',
  error: '#E53935',
  errorSurface: '#FFEBEE',
  neutralIcon: '#4A4A4A',
  neutralSurface: 'rgba(0, 0, 0, 0.05)',
} as const;

export const colors = {
  ...palette,
  cream: palette.backgroundPrimary,
  warmWhite: palette.backgroundSecondary,
  text: palette.textPrimary,
  mutedText: palette.textSecondary,
  accessibleMutedText: palette.textSecondary,
  success: '#54775A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
