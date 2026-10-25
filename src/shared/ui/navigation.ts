export const NAVBAR_HEIGHT = 72;

export function getNavbarBottom(bottomInset: number): number {
  return bottomInset > 0 ? bottomInset + 8 : 16;
}
