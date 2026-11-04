export const NAVBAR_HEIGHT = 60;

export function getNavbarSafePadding(bottomInset: number): number {
  return Math.max(bottomInset, 12);
}
