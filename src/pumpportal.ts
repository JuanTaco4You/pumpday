import WebSocket from 'ws';
import { TokenBook, TradeEvent, NewTokenEvent, MigrationEvent 
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
 from './tokenbook.js';
import { getTokenMetadata 
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
 from './metadata.js';


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
      ws.send(JSON.stringify({ method: 'subscribeNewToken' }));
      ws.send(JSON.stringify({ method: 'subscribeMigration' }));
      // Some streams also emit generic "trade" events without per-mint subscription.
      // We still subscribe per mint on newToken for safety.
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

  private route(raw: any) {
    // Normalize shape: some messages come as { message: 'newToken', data: { ... } }
    // others as { type: 'trade', ... } or plain objects.
    const outerType = String((raw?.message || raw?.type || raw?.event || raw?.channel || '')).toLowerCase();
    const msg = raw?.data ?? raw;

    // Heuristics for type
    const t = outerType.includes('newtoken') ? 'newToken'
            : outerType.includes('migration') ? 'migration'
            : outerType.includes('trade') ? 'trade'
            : (msg?.newToken || msg?.ticker) ? 'newToken'
            : (msg?.migration || msg?.migrated) ? 'migration'
            : (msg?.side && (msg?.mint || msg?.token || msg?.tokenMint)) ? 'trade'
            : '';

    if (t === 'newToken') {
      const e: NewTokenEvent = {
        type: 'newToken',
        mint: msg.mint || msg.token || msg.tokenMint || msg.address || msg.ca || '',
        symbol: msg.ticker || msg.symbol || msg.tkr || '',
        name: msg.name || msg.tokenName || '',
        creator: msg.creator || msg.dev || msg.owner || msg.authority || '',
        ts: Number(msg.timestamp || msg.ts || Date.now() / 1000)
      };
      if (e.mint) {
        this.book.handleNewToken(e);
        this.watchMint(e.mint);
      }
      return;
    }

    if (t === 'migration') {
      const e: MigrationEvent = {
        type: 'migration',
        mint: msg.mint || msg.token || msg.tokenMint || msg.address || msg.ca || '',
        ts: Number(msg.timestamp || msg.ts || Date.now() / 1000)
      };
      if (e.mint) this.book.handleMigration(e);
      return;
    }

    // Trade
    const maybeTrade = msg?.trade || msg;
    if (maybeTrade?.mint || maybeTrade?.token || maybeTrade?.tokenMint || maybeTrade?.ca) {
      const e: TradeEvent = {
        type: 'trade',
        mint: maybeTrade.mint || maybeTrade.token || maybeTrade.tokenMint || maybeTrade.ca || '',
        side: (maybeTrade.side || maybeTrade.direction || 'buy').toLowerCase() === 'sell' ? 'sell' : 'buy',
        priceSol: Number(maybeTrade.price || maybeTrade.priceSol || maybeTrade.solAmount || maybeTrade.sol || 0),
        amountTokens: Number(maybeTrade.amount || maybeTrade.size || maybeTrade.tokenAmount || maybeTrade.tokens || 0),
        account: String(maybeTrade.user || maybeTrade.trader || maybeTrade.buyer || maybeTrade.seller || maybeTrade.signer || ''),
        ts: Number(maybeTrade.timestamp || maybeTrade.ts || Date.now() / 1000)
      };
      if (e.mint) this.book.handleTrade(e);
      return;
    }

    // Unknown message shape — log once in a while for debugging
    if (Math.random() < 0.01) console.log('[pumpportal] unhandled message shape', raw);
  }
}
?api-key=${key
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
` : ENDPOINT;
  
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}


  connect() {
    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.on('open', () => {
      console.log('[pumpportal] connected');
      // subscribe to new tokens, migrations
      ws.send(JSON.stringify({ method: 'subscribeNewToken' 
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
));
      ws.send(JSON.stringify({ method: 'subscribeMigration' 
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
));
    
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        this.route(msg);
      
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
 catch (e) {
        console.error('[pumpportal] parse error', e);
      
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}

    
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
);

    ws.on('close', () => {
      console.log('[pumpportal] closed, reconnecting in 2s');
      setTimeout(() => this.connect(), 2000);
    
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
);

    ws.on('error', (err) => {
      console.error('[pumpportal] error', err);
    
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
);
  
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}


  watchMint(mint: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ method: 'subscribeTokenTrade', keys: [mint] 
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
));
  
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
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
      
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
;
      if (e.mint) {
        this.book.handleNewToken(e);
        this.watchMint(e.mint);
        if (!e.symbol || !e.name) this.maybeEnrich(e.mint);
      
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}

      return;
    
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}


    if (msg?.message === 'migration' || msg?.type === 'migration' || msg?.event === 'migration') {
      const e: MigrationEvent = {
        type: 'migration',
        mint: msg.mint || msg.token || msg.tokenMint || msg.ca || '',
        ts: Number(msg.timestamp || msg.ts || Date.now() / 1000)
      
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
;
      if (e.mint) this.book.handleMigration(e);
      return;
    
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
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
      
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}
;
      if (e.mint) { this.book.handleTrade(e); if (!this.book.tokens.get(e.mint)?.symbol) this.maybeEnrich(e.mint);}
    
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}

  
  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}


  async maybeEnrich(mint: string) {
    if (this.pendingMeta.has(mint)) return;
    this.pendingMeta.add(mint);
    try {
      const m = await getTokenMetadata(mint);
      if (m) this.book.updateMetadata(mint, m);
    } finally {
      this.pendingMeta.delete(mint);
    }
  }
}

