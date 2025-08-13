import { TokenBook, TokenState } from './tokenbook.js';

function mean(a: number[]) { return a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0; }
function std(a: number[]) {
  if (a.length < 2) return 1;
  const m = mean(a); const v = mean(a.map(x => (x-m)*(x-m)));
  return Math.sqrt(v) || 1;
}
function zscore(x: number, arr: number[]) {
  const s = std(arr); const m = mean(arr);
  return s ? (x - m) / s : 0;
}

export function rankTokens(book: TokenBook) {
  const states = Array.from(book.tokens.values());

  // collect features
  const features = states.map((t) => {
    const r60 = t.rolling60, r300 = t.rolling300;
    const buyImb = (r60.volBuySol - r60.volSellSol) / Math.max(1, (r60.volBuySol + r60.volSellSol));
    const buysPerMin = r60.buys;
    const uniq = r60.uniqueBuyers.size;
    const mom5 = momentum(r300.prices);
    const migratingSoon = !!t.migratedAt ? 1 : 0; // simple flag; you could approximate progress on curve

    return {
      mint: t.mint,
      t,
      features: { buyImb, buysPerMin, uniq, mom5, migratingSoon }
    };
  });

  // arrays for z-scores
  const arrBuyImb = features.map(f => f.features.buyImb);
  const arrBuys   = features.map(f => f.features.buysPerMin);
  const arrUniq   = features.map(f => f.features.uniq);
  const arrMom    = features.map(f => f.features.mom5);

  for (const f of features) {
    const zBuy = zscore(f.features.buyImb, arrBuyImb);
    const zBuys = zscore(f.features.buysPerMin, arrBuys);
    const zUniq = zscore(f.features.uniq, arrUniq);
    const zMom  = zscore(f.features.mom5, arrMom);
    const bonus = f.features.migratingSoon ? 0.05 : 0;
    const score = zBuy*0.35 + zBuys*0.30 + zUniq*0.20 + zMom*0.10 + bonus;
    f.t.score = score;
  }

  // sort high to low
  return states.sort((a,b) => (b.score ?? -1) - (a.score ?? -1));
}

function momentum(prices: number[]) {
  if (prices.length < 2) return 0;
  const recent = prices.slice(-20);
  return recent[recent.length-1] / recent[0] - 1;
}
