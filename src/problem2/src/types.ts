export interface RawPrice {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  price: number;
  iconUrl: string;
  balance: number;
}

export type Side = 'pay' | 'receive';
