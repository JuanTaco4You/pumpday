import { z } from 'zod';

export type Side = 'buy' | 'sell';

export interface TradeEvent {
  type: 'trade';
  mint: string;
  side: Side;
  priceSol: number;      // SOL paid/received (approx; depends on payload)
  amountTokens: number;  // tokens bought/sold
  account: string;
  ts: number;            // seconds
}

export interface NewTokenEvent {
  type: 'newToken';
  mint: string;
  symbol: string;
  name: string;
  creator: string;
  ts: number;
}

export interface MigrationEvent {
  type: 'migration';
  mint: string;
  ts: number;
}

export type Event = TradeEvent | NewTokenEvent | MigrationEvent;

export interface Rolling {
  buys: number;
  sells: number;
  volBuySol: number;
  volSellSol: number;
  uniqueBuyers: Set<string>;
  uniqueSellers: Set<string>;
  // for momentum: last seen prices (if available)
  prices: number[];
  lastTrim: number;
}

export interface TokenState {
  mint: string;
  name?: string;
  symbol?: string;
  creator?: string;
  createdAt: number;
  migratedAt?: number;
  lastTradeAt?: number;
  rolling60: Rolling;
  rolling300: Rolling;
  score?: number;
  trades: TradeEvent[]; // bounded
}

function emptyRolling(now: number): Rolling {
  return { buys: 0, sells: 0, volBuySol: 0, volSellSol: 0, uniqueBuyers: new Set(), uniqueSellers: new Set(), prices: [], lastTrim: now };
}

export class TokenBook {
  tokens = new Map<string, TokenState>();
  maxTrades = 500;

  handleNewToken(e: NewTokenEvent) {
    const now = e.ts || Math.floor(Date.now()/1000);
    if (!this.tokens.has(e.mint)) {
      this.tokens.set(e.mint, {
        mint: e.mint,
        name: e.name,
        symbol: e.symbol,
        creator: e.creator,
        createdAt: now,
        rolling60: emptyRolling(now),
        rolling300: emptyRolling(now),
        trades: []
      });
      console.log(`[new] ${e.symbol || ''} ${e.name || ''} ${e.mint}`);
    }
  }

  handleMigration(e: MigrationEvent) {
    const t = this.tokens.get(e.mint);
    if (!t) return;
    t.migratedAt = e.ts;
    console.log(`[migrated] ${t.symbol || ''} ${t.mint}`);
  }

  handleTrade(e: TradeEvent) {
    const t = this.tokens.get(e.mint) || this.bootstrapToken(e);
    const now = e.ts;
    t.lastTradeAt = now;
    t.trades.push(e);
    if (t.trades.length > this.maxTrades) t.trades.shift();

    this.bump(t.rolling60, e, now, 60);
    this.bump(t.rolling300, e, now, 300);
  }

  private bootstrapToken(e: TradeEvent): TokenState {
    const now = e.ts || Math.floor(Date.now()/1000);
    const t: TokenState = {
      mint: e.mint,
      createdAt: now,
      rolling60: emptyRolling(now),
      rolling300: emptyRolling(now),
      trades: []
    };
    this.tokens.set(e.mint, t);
    return t;
  }

  private bump(r: Rolling, e: TradeEvent, now: number, windowSec: number) {
    // trim old trades by lastTrim tick
    if (now - r.lastTrim > 5) {
      // trimming is handled indirectly by recomputing sets via sliding window from TokenState.trades if needed.
      r.lastTrim = now;
      // In this MVP we rely on bounded trades array; for precise windows you would rebuild counts here.
    }
    if (e.side === 'buy') {
      r.buys += 1; r.volBuySol += e.priceSol;
      r.uniqueBuyers.add(e.account);
    } else {
      r.sells += 1; r.volSellSol += e.priceSol;
      r.uniqueSellers.add(e.account);
    }
    // price if we can infer it (SOL per token)
    const price = e.amountTokens > 0 ? e.priceSol / e.amountTokens : 0;
    if (price > 0) {
      r.prices.push(price);
      if (r.prices.length > 300) r.prices.shift();
    }
  }
}
