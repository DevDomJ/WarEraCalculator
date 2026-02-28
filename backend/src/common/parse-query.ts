/**
 * Safely parse a query parameter string to an integer with bounds checking.
 * Returns `defaultValue` if the input is undefined or NaN. Clamps to bounds if out of range.
 */
export function parseIntParam(
  value: string | undefined,
  opts: { default: number; min?: number; max?: number },
): number {
  const parsed = parseInt(value ?? '', 10);
  if (isNaN(parsed)) return opts.default;
  if (opts.min != null && parsed < opts.min) return opts.min;
  if (opts.max != null && parsed > opts.max) return opts.max;
  return parsed;
}

/**
 * Safely parse a query parameter string to a float with bounds checking.
 * Returns `defaultValue` if the input is undefined or NaN. Clamps to bounds if out of range.
 */
export function parseFloatParam(
  value: string | undefined,
  opts: { default: number; min?: number; max?: number },
): number {
  const parsed = parseFloat(value ?? '');
  if (isNaN(parsed)) return opts.default;
  if (opts.min != null && parsed < opts.min) return opts.min;
  if (opts.max != null && parsed > opts.max) return opts.max;
  return parsed;
}
