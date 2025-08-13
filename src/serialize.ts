import type { TokenState } from './tokenbook.js';

export function serializeToken(t: TokenState) {
  const s60 = t.rolling60;
  const s300 = t.rolling300;
  return {
    ...t,
    rolling60: {
      ...s60,
      uniqueBuyersCount: (s60.uniqueBuyers && s60.uniqueBuyers.size) || 0,
      uniqueSellersCount: (s60.uniqueSellers && s60.uniqueSellers.size) || 0,
      // do not serialize the sets
      uniqueBuyers: undefined,
      uniqueSellers: undefined
    },
    rolling300: {
      ...s300,
      uniqueBuyersCount: (s300.uniqueBuyers && s300.uniqueBuyers.size) || 0,
      uniqueSellersCount: (s300.uniqueSellers && s300.uniqueSellers.size) || 0,
      uniqueBuyers: undefined,
      uniqueSellers: undefined
    }
  };
}

export function serializeMany(arr: TokenState[]) {
  return arr.map(serializeToken);
}
