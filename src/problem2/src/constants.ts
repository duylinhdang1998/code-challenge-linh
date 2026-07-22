export const PRICES_URL = 'https://interview.switcheo.com/prices.json';
export const ICON_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

export const ICON_OVERRIDES: Record<string, string> = {
  RATOM: 'rATOM',
  STATOM: 'stATOM',
  STEVMOS: 'stEVMOS',
  STLUNA: 'stLUNA',
  STOSMO: 'stOSMO',
};

/** Preferred default tokens when the feed loads. */
export const DEFAULT_FROM = 'ETH';
export const DEFAULT_TO = 'USDC';

export const SWAP_SIMULATION_MS = 1600;
