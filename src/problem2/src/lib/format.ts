const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '$0.00';
  return usdFormatter.format(value);
}


export function formatAmount(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0';
  const abs = Math.abs(value);
  let maximumFractionDigits: number;
  if (abs >= 1000) maximumFractionDigits = 2;
  else if (abs >= 1) maximumFractionDigits = 4;
  else if (abs >= 0.0001) maximumFractionDigits = 6;
  else maximumFractionDigits = 8;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function parseAmount(input: string): number {
  if (input.trim() === '') return NaN;
  return Number(input.replace(/,/g, ''));
}

export function sanitizeAmount(next: string, previous: string): string {
  if (next === '') return '';
  if (/^\d*\.?\d*$/.test(next)) return next;
  return previous;
}
