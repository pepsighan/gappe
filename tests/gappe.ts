import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Gappe } from '../target/types/gappe';

describe('gappe', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Gappe as Program<Gappe>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
