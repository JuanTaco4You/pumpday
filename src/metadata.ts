import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Metadata, PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';

const RPC = process.env.SOLANA_RPC || clusterApiUrl('mainnet-beta');
const connection = new Connection(RPC, 'confirmed');

export async function getTokenMetadata(mint: string): Promise<{name:string; symbol:string} | null> {
  try {
    const mintKey = new PublicKey(mint);
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), PROGRAM_ID.toBuffer(), mintKey.toBuffer()],
      PROGRAM_ID
    );
    const meta = await Metadata.fromAccountAddress(connection, pda);
    const rawName = meta.data.name || '';
    const rawSymbol = meta.data.symbol || '';
    const name = rawName.replace(/\u0000/g, '').trim();
    const symbol = rawSymbol.replace(/\u0000/g, '').trim();
    if (!name && !symbol) return null;
    return { name, symbol };
  } catch (e) {
    return null;
  }
}
