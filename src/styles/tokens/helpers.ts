export function withAlpha(colorVariable: string, alpha: number) {
  const clampedAlpha = Math.min(1, Math.max(0, alpha));
  const percentage = `${(clampedAlpha * 100).toFixed(0)}%`;
  return `color-mix(in srgb, ${colorVariable} ${percentage}, transparent)`;
}
