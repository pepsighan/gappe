import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Gappe } from '../target/types/gappe';

describe('gappe', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Gappe as Program<Gappe>;

  it('setup profile', async () => {
    const account = anchor.web3.Keypair.generate();

    const tx = await program.rpc.setupProfile('username', {
      accounts: {
        profile: account.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [account],
    });

    // Check whether the username is set.
  });
});
