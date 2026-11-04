import type { WishlistItem } from '../../types';

function getYearFromDate(value: string | null | undefined): number | null {
  const match = value?.match(/^(\d{4})/);
  if (!match) return null;

  const year = Number(match[1]);
  return Number.isInteger(year) && year > 0 ? year : null;
}

export function getWishlistItemYear(item: WishlistItem): number | null {
  return getYearFromDate(item.created_at);
}

export function getAvailableWishlistYears(
  items: WishlistItem[],
  accountCreatedAt: string | null,
  currentYear = new Date().getFullYear(),
): number[] {
  const itemYears = items
    .map(getWishlistItemYear)
    .filter((year): year is number => year !== null);
  const accountYear = getYearFromDate(accountCreatedAt);
  const startingYear = Math.min(
    accountYear ?? Number.POSITIVE_INFINITY,
    ...itemYears,
  );
  const firstYear = Number.isFinite(startingYear) ? startingYear : currentYear;

  return [...new Set([...itemYears, firstYear, currentYear])].sort(
    (left, right) => right - left,
  );
}

export function filterWishlistByYear(
  items: WishlistItem[],
  selectedYear: number | null,
): WishlistItem[] {
  if (selectedYear === null) return items;
  return items.filter((item) => getWishlistItemYear(item) === selectedYear);
}
