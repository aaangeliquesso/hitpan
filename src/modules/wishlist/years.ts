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

export function getWishlistItemMonth(item: WishlistItem): string {
  const timestamp = Date.parse(item.created_at);
  if (Number.isFinite(timestamp)) {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'long',
      timeZone: 'UTC',
    });
  }
  return item.month_name;
}

export function getWishlistItemDay(item: WishlistItem): number {
  const timestamp = Date.parse(item.created_at);
  if (Number.isFinite(timestamp)) {
    return new Date(timestamp).getUTCDate();
  }
  return item.day;
}

export function getWishlistCounts(items: WishlistItem[]) {
  return {
    total: items.length,
    bought: items.filter((item) => item.is_bought).length,
  };
}

export function sortWishlistByCreatedAt(items: WishlistItem[]): WishlistItem[] {
  return [...items].sort(
    (left, right) =>
      Date.parse(right.created_at) - Date.parse(left.created_at),
  );
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
