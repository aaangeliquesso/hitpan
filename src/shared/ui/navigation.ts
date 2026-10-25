export const NAVBAR_HEIGHT = 76;

export function getNavbarSafePadding(bottomInset: number): number {
  return Math.max(bottomInset, 12);
}
