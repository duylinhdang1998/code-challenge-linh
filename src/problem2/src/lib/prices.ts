import { ICON_BASE, ICON_OVERRIDES, PRICES_URL } from '../constants';
import type { RawPrice, Token } from '../types';

function iconUrl(symbol: string): string {
  return `${ICON_BASE}/${ICON_OVERRIDES[symbol] ?? symbol}.svg`;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * The challenge has no wallet, so we fabricate a believable balance per token
 * (worth roughly $250–$12,250) — enough to make MAX and the "insufficient
 * balance" validation feel real.
 */
function mockBalance(symbol: string, price: number): number {
  const targetUsd = 250 + (hash(symbol) % 12000);
  return targetUsd / price;
}

/**
 * Fetch the price feed and turn it into a clean, sorted token list:
 * - drop rows without a positive price (some tokens have none),
 * - de-duplicate, keeping the most recent quote per currency.
 */
export async function fetchTokens(signal?: AbortSignal): Promise<Token[]> {
  const res = await fetch(PRICES_URL, { signal });
  if (!res.ok) {
    throw new Error(`Failed to load prices (HTTP ${res.status})`);
  }
  const rows = (await res.json()) as RawPrice[];

  const latest = new Map<string, RawPrice>();
  for (const row of rows) {
    if (!row || typeof row.price !== 'number' || row.price <= 0) continue;
    const prev = latest.get(row.currency);
    if (!prev || new Date(row.date).getTime() > new Date(prev.date).getTime()) {
      latest.set(row.currency, row);
    }
  }

  return Array.from(latest.values())
    .map<Token>((row) => ({
      symbol: row.currency,
      price: row.price,
      iconUrl: iconUrl(row.currency),
      balance: mockBalance(row.currency, row.price),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}
