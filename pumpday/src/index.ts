import 'dotenv/config';
import express from 'express';
import { PumpPortal } from './pumpportal.js';
import { TokenBook } from './tokenbook.js';
import { rankTokens } from './scorer.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT || 8787);

// data stores
const book = new TokenBook();
const ws = new PumpPortal(book);

app.get('/tokens/top', (req, res) => {
  const limit = Math.min(200, Number(req.query.limit || 50));
  const ranked = rankTokens(book).slice(0, limit);
  res.json(ranked);
});

app.get('/tokens', (req, res) => {
  res.json(rankTokens(book));
});

app.get('/tokens/:mint', (req, res) => {
  const { mint } = req.params;
  const t = book.tokens.get(mint);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

// static dashboard
app.use('/', express.static(path.join(__dirname, '../public')));

app.listen(PORT, () => {
  console.log(`[pumpday] http://localhost:${PORT}`);
  ws.connect();
});
