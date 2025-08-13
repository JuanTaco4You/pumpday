import WebSocket from 'ws';
import { TokenBook, TradeEvent, NewTokenEvent, MigrationEvent } from './tokenbook.js';

const ENDPOINT = 'wss://pumpportal.fun/api/data';

export class PumpPortal {
  private ws?: WebSocket;
  private url: string;

  constructor(private book: TokenBook) {
    const key = process.env.PUMPPORTAL_API_KEY?.trim();
    this.url = key ? `${ENDPOINT}?api-key=${key}` : ENDPOINT;
  }

  connect() {
    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.on('open', () => {
      console.log('[pumpportal] connected');
      // subscribe to new tokens, migrations
      ws.send(JSON.stringify({ method: 'subscribeNewToken' }));
      ws.send(JSON.stringify({ method: 'subscribeMigration' }));
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        this.route(msg);
      } catch (e) {
        console.error('[pumpportal] parse error', e);
      }
    });

    ws.on('close', () => {
      console.log('[pumpportal] closed, reconnecting in 2s');
      setTimeout(() => this.connect(), 2000);
    });

    ws.on('error', (err) => {
      console.error('[pumpportal] error', err);
    });
  }

  watchMint(mint: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ method: 'subscribeTokenTrade', keys: [mint] }));
  }

  private route(msg: any) {
    // Messages from PumpPortal vary by type; we sniff common fields.
    if (msg?.message === 'newToken' || msg?.type === 'newToken' || msg?.event === 'newToken') {
      const e: NewTokenEvent = {
        type: 'newToken',
        mint: msg.mint || msg.token || msg.tokenMint || msg.ca || '',
        symbol: msg.symbol || msg.ticker || '',
        name: msg.name || '',
        creator: msg.creator || msg.dev || msg.owner || '',
        ts: Number(msg.timestamp || msg.ts || Date.now() / 1000)
      };
      if (e.mint) {
        this.book.handleNewToken(e);
        this.watchMint(e.mint);
      }
      return;
    }

    if (msg?.message === 'migration' || msg?.type === 'migration' || msg?.event === 'migration') {
      const e: MigrationEvent = {
        type: 'migration',
        mint: msg.mint || msg.token || msg.tokenMint || msg.ca || '',
        ts: Number(msg.timestamp || msg.ts || Date.now() / 1000)
      };
      if (e.mint) this.book.handleMigration(e);
      return;
    }

    // Trades (bonding curve or PumpSwap if API key is set)
    const maybeTrade = msg?.trade || msg;
    if (maybeTrade?.mint || maybeTrade?.token || maybeTrade?.tokenMint) {
      const e: TradeEvent = {
        type: 'trade',
        mint: maybeTrade.mint || maybeTrade.token || maybeTrade.tokenMint || maybeTrade.ca || '',
        side: (maybeTrade.side || maybeTrade.direction || 'buy').toLowerCase() === 'sell' ? 'sell' : 'buy',
        priceSol: Number(maybeTrade.price || maybeTrade.priceSol || maybeTrade.solAmount || 0),
        amountTokens: Number(maybeTrade.amount || maybeTrade.size || maybeTrade.tokenAmount || 0),
        account: String(maybeTrade.user || maybeTrade.trader || maybeTrade.buyer || maybeTrade.seller || ''),
        ts: Number(maybeTrade.timestamp || maybeTrade.ts || Date.now() / 1000)
      };
      if (e.mint) this.book.handleTrade(e);
    }
  }
}
